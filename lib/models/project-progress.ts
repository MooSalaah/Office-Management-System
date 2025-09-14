import { taskModel } from './task'
import { projectModel } from './project'

export async function updateProjectProgress(projectId: string): Promise<void> {
  try {
    // Get all tasks for this project
    const projectTasks = await taskModel.findByProject(projectId)
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length
    
    // Update project progress
    await projectModel.updateProgressFromTasks(projectId, completedTasks, totalTasks)
  } catch (error) {
    console.error('Failed to update project progress:', error)
  }
}
