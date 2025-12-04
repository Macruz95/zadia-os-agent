import { ProjectsService } from '@/modules/projects/services/projects.service';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export async function getProjectMetrics(tenantId: string) {
    try {
        if (!tenantId) {
            return {
                activeProjects: 0,
                completedTasks: 0,
                pendingTasks: 0,
                projectProgress: 0
            };
        }

        const allProjectsResult = await ProjectsService.searchProjects({ tenantId }, 1000);
        const allProjects = allProjectsResult.projects;

        // 1. Active Projects
        const active = allProjects.filter(p => p.status === 'in-progress').length;

        // 2. At Risk Projects
        const now = new Date();
        const atRisk = allProjects.filter(p => {
            const isOverBudget = (p.actualCost || 0) > (p.estimatedCost || 0);
            const isOverdue = p.estimatedEndDate && p.estimatedEndDate.toDate && p.estimatedEndDate.toDate() < now && p.status !== 'completed' && p.status !== 'cancelled';
            return isOverBudget || isOverdue;
        }).length;

        // 3. Completed This Month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const completedThisMonth = allProjects.filter(p => {
            if (p.status !== 'completed') return false;
            return p.updatedAt.toDate() >= startOfMonth;
        }).length;

        // 4. Total Tasks Pending with tenantId filter
        const tasksQuery = query(
            collection(db, 'projectTasks'),
            where('tenantId', '==', tenantId),
            where('status', 'in', ['pending', 'in-progress'])
        );
        const tasksSnap = await getDocs(tasksQuery);
        const totalTasksPending = tasksSnap.size;

        return {
            activeProjects: active,
            completedTasks: completedThisMonth,
            pendingTasks: totalTasksPending,
            projectProgress: active > 0 ? Math.round((completedThisMonth / (completedThisMonth + active)) * 100) : 0
        };
    } catch (error) {
        logger.error('Error calculating project metrics', error as Error);
        return {
            activeProjects: 0,
            completedTasks: 0,
            pendingTasks: 0,
            projectProgress: 0
        };
    }
}
