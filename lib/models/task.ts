import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Task, TaskCreate, TaskUpdate } from '../schemas/task'

export class TaskModel {
  private collection!: Collection

  constructor() {
    // Don't initialize collection in constructor
  }

  private async initCollection() {
    if (this.collection) return
    
    const db = await getDatabase()
    this.collection = db.collection('tasks')
    
    // Create indexes
    await this.collection.createIndex({ title: 1 })
    await this.collection.createIndex({ status: 1 })
    await this.collection.createIndex({ priority: 1 })
    await this.collection.createIndex({ assignedTo: 1 })
    await this.collection.createIndex({ projectId: 1 })
    await this.collection.createIndex({ dueDate: 1 })
    await this.collection.createIndex({ createdAt: -1 })
  }

  async create(taskData: TaskCreate): Promise<Task> {
    await this.initCollection()
    
    const task: Omit<Task, '_id'> = {
      ...taskData,
      actualHours: 0,
      progress: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.collection.insertOne(task)
    return { _id: result.insertedId.toString(), ...task }
  }

  async findById(id: string): Promise<Task | null> {
    await this.initCollection()
    const task = await this.collection.findOne({ _id: new ObjectId(id) })
    return task ? { ...task, _id: task._id.toString() } as Task : null
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.findAll({ projectId })
  }

  async findAll(filter: Partial<Task> = {}): Promise<Task[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const tasks = await this.collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async findActive(): Promise<Task[]> {
    await this.initCollection()
    const tasks = await this.collection.find({
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
    await this.initCollection()
    const tasks = await this.collection.find({
      assignedTo: { $in: [userId] }
    }).sort({ createdAt: -1 }).toArray()
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async update(id: string, updateData: TaskUpdate): Promise<Task | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Task : null
  }

  async delete(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async updateProgress(id: string, progress: number): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
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
    await this.initCollection()
    const regex = new RegExp(query, 'i')
    const tasks = await this.collection.find({
      $or: [
        { title: regex },
        { description: regex },
        { tags: { $in: [regex] } }
      ]
    }).sort({ createdAt: -1 }).toArray()
    
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async getStats() {
    await this.initCollection()
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]
    
    const stats = await this.collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {} as Record<string, number>)
  }

  async getPriorityStats() {
    await this.initCollection()
    const pipeline = [
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]
    
    const stats = await this.collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {} as Record<string, number>)
  }

  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    await this.initCollection()
    const tasks = await this.collection.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async getOverdueTasks(): Promise<Task[]> {
    await this.initCollection()
    const today = new Date()
    const tasks = await this.collection.find({
      dueDate: { $lt: today },
      status: { $in: ['pending', 'in-progress'] }
    }).toArray()
    
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as Task))
  }

  async countByStatus(status: string): Promise<number> {
    await this.initCollection()
    return this.collection.countDocuments({ status: status as any })
  }

  async countByPriority(priority: string): Promise<number> {
    await this.initCollection()
    return this.collection.countDocuments({ priority: priority as any })
  }
}

export const taskModel = new TaskModel() 