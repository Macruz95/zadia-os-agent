/**
 * ZADIA OS - Backup Triggers
 * 
 * Automated Firestore backups using Cloud Functions
 * Runs daily at 3:00 AM UTC
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const firestore = admin.firestore();

/**
 * Scheduled Backup - Runs daily at 3:00 AM UTC
 * 
 * Creates a backup of critical collections to a backup collection
 * This is a simple in-Firestore backup for quick recovery
 * 
 * For full disaster recovery, enable automated exports in Firebase Console:
 * Firebase Console > Firestore > Import/Export > Schedule Export
 */
export const scheduledBackup = functions.pubsub
  .schedule('0 3 * * *') // Every day at 3:00 AM UTC
  .timeZone('America/Mexico_City')
  .onRun(async () => {
    const timestamp = new Date().toISOString();
    const backupDate = timestamp.split('T')[0]; // YYYY-MM-DD
    
    console.log(`🔄 Starting scheduled backup at ${timestamp}`);

    // Collections to backup (critical data)
    const collectionsToBackup = [
      'users',
      'clients',
      'projects',
      'invoices',
      'employees',
    ];

    const backupSummary: Record<string, number> = {};

    try {
      for (const collectionName of collectionsToBackup) {
        const snapshot = await firestore.collection(collectionName).get();
        let docCount = 0;

        // Create backup documents
        const batch = firestore.batch();
        const backupCollectionRef = firestore.collection(`backups/${backupDate}/${collectionName}`);

        snapshot.docs.forEach((doc) => {
          const backupDocRef = backupCollectionRef.doc(doc.id);
          batch.set(backupDocRef, {
            ...doc.data(),
            _backupTimestamp: timestamp,
            _originalId: doc.id,
          });
          docCount++;
        });

        await batch.commit();
        backupSummary[collectionName] = docCount;
        console.log(`✅ Backed up ${docCount} documents from ${collectionName}`);
      }

      // Log backup metadata
      await firestore.collection('backups').doc(backupDate).set({
        timestamp,
        collections: backupSummary,
        totalDocuments: Object.values(backupSummary).reduce((a, b) => a + b, 0),
        status: 'completed',
      });

      console.log(`✅ Backup completed successfully`, backupSummary);

      // Clean up old backups (keep last 7 days)
      await cleanupOldBackups(7);

      return { success: true, summary: backupSummary };
    } catch (error) {
      console.error('❌ Backup failed:', error);
      
      // Log failed backup
      await firestore.collection('backups').doc(backupDate).set({
        timestamp,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return { success: false, error };
    }
  });

/**
 * Clean up backups older than specified days
 */
async function cleanupOldBackups(keepDays: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - keepDays);
  const cutoffString = cutoffDate.toISOString().split('T')[0];

  console.log(`🧹 Cleaning up backups older than ${cutoffString}`);

  const backupsSnapshot = await firestore.collection('backups').get();
  
  for (const doc of backupsSnapshot.docs) {
    if (doc.id < cutoffString) {
      // Delete the backup document
      await doc.ref.delete();
      
      // Note: In production, you'd also delete the subcollections
      // This requires recursive deletion which is more complex
      console.log(`🗑️ Deleted old backup: ${doc.id}`);
    }
  }
}

/**
 * Manual Backup - Callable function for admins
 * 
 * Usage from client:
 * const manualBackup = httpsCallable(functions, 'manualBackup');
 * const result = await manualBackup();
 */
export const manualBackup = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can trigger manual backups'
    );
  }

  const timestamp = new Date().toISOString();
  const backupId = `manual-${timestamp.replace(/[:.]/g, '-')}`;

  console.log(`🔄 Starting manual backup by admin ${context.auth.uid}`);

  const collectionsToBackup = ['users', 'clients', 'projects', 'invoices', 'employees'];
  const backupSummary: Record<string, number> = {};

  try {
    for (const collectionName of collectionsToBackup) {
      const snapshot = await firestore.collection(collectionName).get();
      let docCount = 0;

      const batch = firestore.batch();
      const backupCollectionRef = firestore.collection(`backups/${backupId}/${collectionName}`);

      snapshot.docs.forEach((doc) => {
        const backupDocRef = backupCollectionRef.doc(doc.id);
        batch.set(backupDocRef, {
          ...doc.data(),
          _backupTimestamp: timestamp,
          _originalId: doc.id,
        });
        docCount++;
      });

      await batch.commit();
      backupSummary[collectionName] = docCount;
    }

    await firestore.collection('backups').doc(backupId).set({
      timestamp,
      triggeredBy: context.auth.uid,
      type: 'manual',
      collections: backupSummary,
      totalDocuments: Object.values(backupSummary).reduce((a, b) => a + b, 0),
      status: 'completed',
    });

    console.log(`✅ Manual backup completed`, backupSummary);

    return { 
      success: true, 
      backupId, 
      summary: backupSummary,
      totalDocuments: Object.values(backupSummary).reduce((a, b) => a + b, 0),
    };
  } catch (error) {
    console.error('❌ Manual backup failed:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});
