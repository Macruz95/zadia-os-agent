import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Migration function to add tenantId to existing documents
 * This is a one-time migration that can be triggered manually
 */
export const migrateToMultiTenant = functions.https.onCall(async (request) => {
  // Verify the caller is an admin
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const userId = request.auth.uid;
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData || userData.role !== 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Must be a super admin');
  }

  const results = {
    tenantsCreated: 0,
    documentsUpdated: 0,
    errors: [] as string[],
  };

  try {
    // Step 1: Get all unique users
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Step 2: Create a tenant for each user that doesn't have one
    for (const user of users) {
      const existingTenant = await db
        .collection('tenants')
        .where('ownerId', '==', user.id)
        .limit(1)
        .get();

      if (existingTenant.empty) {
        // Create tenant for this user
        const tenantRef = db.collection('tenants').doc();
        const now = admin.firestore.Timestamp.now();

        const tenant = {
          id: tenantRef.id,
          name: (user as Record<string, unknown>).organization || `Empresa de ${(user as Record<string, unknown>).displayName || 'Usuario'}`,
          slug: `tenant-${user.id.substring(0, 8)}`,
          ownerId: user.id,
          plan: 'free',
          settings: {
            currency: 'USD',
            timezone: 'America/Mexico_City',
            dateFormat: 'DD/MM/YYYY',
            language: (user as Record<string, unknown>).language || 'es',
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
          },
          createdAt: now,
          updatedAt: now,
          isActive: true,
          usage: {
            users: 1,
            storage: 0,
            projects: 0,
            clients: 0,
          },
        };

        await tenantRef.set(tenant);

        // Create tenant member entry for the owner
        const memberRef = db.collection('tenantMembers').doc(`${tenantRef.id}_${user.id}`);
        await memberRef.set({
          id: memberRef.id,
          tenantId: tenantRef.id,
          userId: user.id,
          email: (user as Record<string, unknown>).email || '',
          displayName: (user as Record<string, unknown>).displayName || 'Usuario',
          role: 'owner',
          permissions: [],
          joinedAt: now,
          invitedBy: user.id,
          isActive: true,
        });

        results.tenantsCreated++;
      }
    }

    // Step 3: Update existing documents with tenantId
    const collectionsToMigrate = [
      'clients',
      'leads',
      'opportunities',
      'quotes',
      'invoices',
      'payments',
      'projects',
      'orders',
      'employees',
      'raw-materials',
      'finished-products',
      'bill-of-materials',
    ];

    for (const collectionName of collectionsToMigrate) {
      const collectionRef = db.collection(collectionName);
      const snapshot = await collectionRef.where('tenantId', '==', null).limit(500).get();

      if (snapshot.empty) {
        continue;
      }

      const batch = db.batch();
      let count = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const ownerId = data.userId || data.createdBy || data.ownerId;

        if (ownerId) {
          // Find tenant for this owner
          const tenantSnapshot = await db
            .collection('tenants')
            .where('ownerId', '==', ownerId)
            .limit(1)
            .get();

          if (!tenantSnapshot.empty) {
            const tenantId = tenantSnapshot.docs[0].id;
            batch.update(doc.ref, { tenantId });
            count++;
          }
        }
      }

      if (count > 0) {
        await batch.commit();
        results.documentsUpdated += count;
      }
    }

    return {
      success: true,
      ...results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(errorMessage);
    return {
      success: false,
      ...results,
    };
  }
});

/**
 * Automatically add tenantId to new documents
 * This trigger runs whenever a new document is created in tenant-aware collections
 */
export const addTenantIdOnCreate = functions.firestore.onDocumentCreated(
  '{collectionId}/{docId}',
  async (event) => {
    const collectionId = event.params.collectionId;
    const docId = event.params.docId;
    const data = event.data?.data();

    // Skip if document already has tenantId
    if (data?.tenantId) {
      return null;
    }

    // Skip system collections
    const systemCollections = [
      'users',
      'tenants',
      'tenantMembers',
      'tenantInvitations',
      'customRoles',
      'countries',
      'departments',
      'municipalities',
      'districts',
      'phone-codes',
      'system-config',
    ];

    if (systemCollections.includes(collectionId)) {
      return null;
    }

    // Find tenantId based on userId/createdBy
    const ownerId = data?.userId || data?.createdBy || data?.ownerId;

    if (!ownerId) {
      return null;
    }

    try {
      const tenantSnapshot = await db
        .collection('tenants')
        .where('ownerId', '==', ownerId)
        .limit(1)
        .get();

      if (!tenantSnapshot.empty) {
        const tenantId = tenantSnapshot.docs[0].id;
        await db.collection(collectionId).doc(docId).update({ tenantId });
      }
    } catch (error) {
      console.error('Error adding tenantId:', error);
    }

    return null;
  }
);
