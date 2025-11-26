import { onboardingClientTemplate } from './onboarding-client';
import { invoiceReminderTemplate } from './invoice-reminder';
import { projectKickoffTemplate } from './project-kickoff';
import type { WorkflowTemplate } from '../types/workflows.types';
import type { Workflow } from '../types/workflows.types';

export { onboardingClientTemplate } from './onboarding-client';
export { invoiceReminderTemplate } from './invoice-reminder';
export { projectKickoffTemplate } from './project-kickoff';

type WorkflowTemplateData = Omit<Workflow, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'createdBy'>;

export const workflowTemplates: Partial<Record<WorkflowTemplate, WorkflowTemplateData>> = {
  'onboarding-client': onboardingClientTemplate,
  'invoice-reminder': invoiceReminderTemplate,
  'project-kickoff': projectKickoffTemplate
};

