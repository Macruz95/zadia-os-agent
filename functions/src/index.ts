/**
 * ZADIA OS - Cloud Functions
 * 
 * Handles custom claims assignment and user management
 * 
 * Functions:
 * - assignDefaultRole: Auto-assign 'user' role to new users
 * - migrateExistingUsers: Callable function to assign roles to existing users
 * - updateUserRole: Callable function for admins to change user roles
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Trigger: Automatically assign default role to new users
 * 
 * Runs when a user is created via Firebase Auth
 * Assigns 'user' role by default
 */
export const assignDefaultRole = functions.auth.user().onCreate(async (user) => {
  try {
    // Set custom claims with default role
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'user'
    });

    console.log(`✅ Assigned default role 'user' to user ${user.uid} (${user.email})`);

    return {
      success: true,
      uid: user.uid,
      role: 'user'
    };
  } catch (error) {
    console.error(`❌ Error assigning role to user ${user.uid}:`, error);

    // Don't throw - allow user creation to succeed even if custom claims fail
    // User can still access the app, just with limited permissions until admin fixes
    return {
      success: false,
      uid: user.uid,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

/**
 * Callable Function: Migrate existing users to have custom claims
 * 
 * Only admins can execute this
 * Assigns 'user' role to all users without custom claims
 * 
 * Usage from client:
 * const migrateUsers = httpsCallable(functions, 'migrateExistingUsers');
 * const result = await migrateUsers();
 */
export const migrateExistingUsers = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function'
    );
  }

  // Verify admin role
  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can migrate users'
    );
  }

  try {
    const listUsersResult = await admin.auth().listUsers();
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log(`📋 Starting migration for ${listUsersResult.users.length} users...`);

    for (const user of listUsersResult.users) {
      try {
        // Get current custom claims
        const userRecord = await admin.auth().getUser(user.uid);

        if (!userRecord.customClaims?.role) {
          // User doesn't have a role, assign default
          await admin.auth().setCustomUserClaims(user.uid, {
            role: 'user'
          });

          migratedCount++;
          console.log(`✅ Migrated user ${user.uid} (${user.email || 'no email'})`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped user ${user.uid} - already has role: ${userRecord.customClaims.role}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating user ${user.uid}:`, error);
      }
    }

    const summary = {
      total: listUsersResult.users.length,
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Migration Summary:', summary);

    return summary;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

/**
 * Callable Function: Update user role
 * 
 * Only admins can execute this
 * Changes a user's role
 * 
 * Usage from client:
 * const updateRole = httpsCallable(functions, 'updateUserRole');
 * await updateRole({ uid: 'user123', role: 'manager' });
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function'
    );
  }

  // Verify admin role
  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can update user roles'
    );
  }

  // Validate input
  const { uid, role } = data;

  if (!uid || typeof uid !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing or invalid uid'
    );
  }

  if (!role || !['admin', 'manager', 'user'].includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Role must be one of: admin, manager, user'
    );
  }

  try {
    // Update custom claims
    await admin.auth().setCustomUserClaims(uid, { role });

    // Get user info for logging
    const userRecord = await admin.auth().getUser(uid);

    console.log(`✅ Updated role for user ${uid} (${userRecord.email || 'no email'}) to '${role}' by admin ${context.auth.uid}`);

    return {
      success: true,
      uid,
      role,
      email: userRecord.email,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Error updating role for user ${uid}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update user role: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

// Export Project Triggers
export * from './triggers/project-triggers';
