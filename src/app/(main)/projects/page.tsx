import { ProjectsDirectory } from '@/modules/projects/components/ProjectsDirectory';

/**
 * Projects Page - Main entry point for Projects module
 * Route: /projects
 * 
 * Rule #1: Real Firebase data via ProjectsDirectory
 * Rule #2: ShadCN UI components
 * Rule #4: Modular architecture
 */
export default function ProjectsPage() {
  return <ProjectsDirectory />;
}
