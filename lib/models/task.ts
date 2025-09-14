import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Task, TaskCreate, TaskUpdate } from '../schemas/task'
import { updateProjectProgress } from './project-progress'

export class TaskModel {
  private collection: Promise<Collection>

  constructor() {
    this.collection = this.initCollection()
  }

  private async initCollection(): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection('tasks')
    
    // Create indexes
    await collection.createIndex({ title: 1 })
    await collection.createIndex({ status: 1 })
    await collection.createIndex({ priority: 1 })
    await collection.createIndex({ assignedTo: 1 })
    await collection.createIndex({ projectId: 1 })
    await collection.createIndex({ dueDate: 1 })
    await collection.createIndex({ createdAt: -1 })

    return collection
  }

  async create(taskData: TaskCreate): Promise<Task> {
    const collection = await this.collection
    
    const task: Omit<Task, '_id'> = {
      ...taskData,
      actualHours: 0,
      progress: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(task)
    return { _id: result.insertedId.toString(), ...task }
  }

  async findById(id: string): Promise<Task | null> {
    const collection = await this.collection
    const task = await collection.findOne({ _id: new ObjectId(id) })
    return task ? { ...task, _id: task._id.toString() } as Task : null
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.findAll({ projectId })
  }

  async findAll(filter: Partial<Task> = {}): Promise<Task[]> {
    const collection = await this.collection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const tasks = await collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async findActive(): Promise<Task[]> {
    const collection = await this.collection
    const tasks = await collection.find({
      status: { $in: ['pending', 'in-progress'] }
    }).sort({ createdAt: -1 }).toArray()
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async findByStatus(status: string): Promise<Task[]> {
    return this.findAll({ status: status as any })
  }

  async findByPriority(priority: string): Promise<Task[]> {
    return this.findAll({ priority: priority as any })
  }

  async findByAssignedTo(userId: string): Promise<Task[]> {
    const collection = await this.collection
    const tasks = await collection.find({
      assignedTo: { $in: [userId] }
    }).sort({ createdAt: -1 }).toArray()
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async update(id: string, updateData: TaskUpdate): Promise<Task | null> {
    const collection = await this.collection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    const updatedTask = result ? { ...result, _id: result._id.toString() } as Task : null

    // If task status changed to completed, update project progress
    if (updatedTask && updateData.status === 'completed' && updatedTask.projectId) {
      await updateProjectProgress(updatedTask.projectId)
    }

    return updatedTask
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async updateProgress(id: string, progress: number): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          progress, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async search(query: string): Promise<Task[]> {
    const collection = await this.collection
    const regex = new RegExp(query, 'i')
    const tasks = await collection.find({
      $or: [
        { title: regex },
        { description: regex },
        { tags: { $in: [regex] } }
      ]
    }).sort({ createdAt: -1 }).toArray()
    
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async getStats() {
    const collection = await this.collection
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]
    
    const stats = await collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {} as Record<string, number>)
  }

  async getPriorityStats() {
    const collection = await this.collection
    const pipeline = [
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]
    
    const stats = await collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {} as Record<string, number>)
  }

  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    const collection = await this.collection
    const tasks = await collection.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async getOverdueTasks(): Promise<Task[]> {
    const collection = await this.collection
    const today = new Date()
    const tasks = await collection.find({
      dueDate: { $lt: today },
      status: { $in: ['pending', 'in-progress'] }
    }).toArray()
    
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async countByStatus(status: string): Promise<number> {
    const collection = await this.collection
    return collection.countDocuments({ status: status as any })
  }

  async countByPriority(priority: string): Promise<number> {
    const collection = await this.collection
    return collection.countDocuments({ priority: priority as any })
  }
}

export const taskModel = new TaskModel() 