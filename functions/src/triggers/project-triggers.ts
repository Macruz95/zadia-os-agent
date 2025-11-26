import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Trigger: Update Project Budget on Expense Change
 * 
 * Listens for any change (create, update, delete) in 'expenses' collection
 * Recalculates the total expenses for the associated project
 * Updates the project's 'budgetSpent' and 'remainingBudget' fields
 */
export const onExpenseWrite = functions.firestore
    .document('expenses/{expenseId}')
    .onWrite(async (change, _context) => {
        const expenseData = change.after.exists ? change.after.data() : change.before.data();
        const projectId = expenseData?.projectId;

        if (!projectId) {
            console.log('⚠️ Expense has no projectId, skipping budget update.');
            return null;
        }

        console.log(`🔄 Recalculating budget for project: ${projectId}`);

        try {
            // 1. Calculate total expenses for this project
            // We query ALL expenses for the project to ensure absolute consistency (Source of Truth)
            const expensesSnapshot = await db.collection('expenses')
                .where('projectId', '==', projectId)
                .get();

            let totalSpent = 0;
            expensesSnapshot.forEach(doc => {
                const data = doc.data();
                // Ensure we handle strings or numbers safely
                const amount = Number(data.amount) || 0;
                totalSpent += amount;
            });

            // 2. Get the current project data to find the total budget
            const projectRef = db.collection('projects').doc(projectId);

            await db.runTransaction(async (transaction) => {
                const projectDoc = await transaction.get(projectRef);

                if (!projectDoc.exists) {
                    throw new Error(`Project ${projectId} not found`);
                }

                const projectData = projectDoc.data();
                const totalBudget = Number(projectData?.budget) || 0;
                const remainingBudget = totalBudget - totalSpent;

                // 3. Update the project with new calculated values
                transaction.update(projectRef, {
                    budgetSpent: totalSpent,
                    remainingBudget: remainingBudget,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log(`✅ Budget updated for ${projectId}: Spent=${totalSpent}, Remaining=${remainingBudget}`);
            });

        } catch (error) {
            console.error(`❌ Error updating project budget for ${projectId}:`, error);
        }

        return null;
    });

/**
 * Trigger: Update Project Progress on Task Change
 * 
 * Listens for any change in 'tasks' collection
 * Recalculates the progress percentage for the associated project
 */
export const onTaskWrite = functions.firestore
    .document('tasks/{taskId}')
    .onWrite(async (change, _context) => {
        const taskData = change.after.exists ? change.after.data() : change.before.data();
        const projectId = taskData?.projectId;

        if (!projectId) {
            return null;
        }

        console.log(`🔄 Recalculating progress for project: ${projectId}`);

        try {
            // 1. Get all tasks for this project
            const tasksSnapshot = await db.collection('tasks')
                .where('projectId', '==', projectId)
                .get();

            const totalTasks = tasksSnapshot.size;

            if (totalTasks === 0) {
                return null;
            }

            let completedTasks = 0;
            tasksSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'done' || data.status === 'completed') {
                    completedTasks++;
                }
            });

            // 2. Calculate progress percentage
            const progress = Math.round((completedTasks / totalTasks) * 100);

            // 3. Update project
            await db.collection('projects').doc(projectId).update({
                progress: progress,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✅ Progress updated for ${projectId}: ${progress}% (${completedTasks}/${totalTasks})`);

        } catch (error) {
            console.error(`❌ Error updating project progress for ${projectId}:`, error);
        }

        return null;
    });
