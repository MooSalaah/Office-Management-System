import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { DefaultTask, DefaultTaskCreate, DefaultTaskUpdate } from '../schemas/default-tasks'

export class DefaultTaskModel {
  private collection!: Collection

  constructor() {
    // Don't initialize collection in constructor
  }

  private async initCollection() {
    if (this.collection) return

    const db = await getDatabase()
    this.collection = db.collection('default_tasks')

    // Create indexes
    await this.collection.createIndex({ title: 1 })
    await this.collection.createIndex({ category: 1 })
    await this.collection.createIndex({ isActive: 1 })
    await this.collection.createIndex({ createdAt: -1 })
  }

  async create(taskData: DefaultTaskCreate): Promise<DefaultTask> {
    await this.initCollection()

    const task: Omit<DefaultTask, '_id'> = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.collection.insertOne(task)
    return { _id: result.insertedId.toString(), ...task }
  }

  async findById(id: string): Promise<DefaultTask | null> {
    await this.initCollection()
    const task = await this.collection.findOne({ _id: new ObjectId(id) })
    return task ? { ...task, _id: task._id.toString() } as DefaultTask : null
  }

  async findAll(filter: Partial<DefaultTask> = {}): Promise<DefaultTask[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const tasks = await this.collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return tasks.map(task => ({ ...task, _id: task._id.toString() } as DefaultTask))
  }

  async findActive(): Promise<DefaultTask[]> {
    return this.findAll({ isActive: true })
  }

  async findByCategory(category: string): Promise<DefaultTask[]> {
    return this.findAll({ category: category as any })
  }

  async update(id: string, updateData: DefaultTaskUpdate): Promise<DefaultTask | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as DefaultTask : null
  }

  async delete(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async search(query: string): Promise<DefaultTask[]> {
    await this.initCollection()
    const regex = new RegExp(query, 'i')
    const tasks = await this.collection.find({
      $or: [
        { title: regex },
        { description: regex }
      ]
    }).sort({ createdAt: -1 }).toArray()

    return tasks.map(task => ({ ...task, _id: task._id.toString() } as DefaultTask))
  }

  async getStats() {
    await this.initCollection()
    const pipeline = [
      {
        $group: {
          _id: '$category',
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
}

export const defaultTaskModel = new DefaultTaskModel() 