import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { ProjectTypeDefinition, ProjectTypeDefinitionCreate, ProjectTypeDefinitionUpdate } from '../schemas/project-types'

export class ProjectTypeDefinitionModel {
  private collection!: Collection

  constructor() {
    // Don't initialize collection in constructor
  }

  private async initCollection() {
    if (this.collection) return

    const db = await getDatabase()
    this.collection = db.collection('project_types')

    // Create indexes
    await this.collection.createIndex({ name: 1 })
    await this.collection.createIndex({ isActive: 1 })
    await this.collection.createIndex({ createdAt: -1 })
  }

  async create(typeData: ProjectTypeDefinitionCreate): Promise<ProjectTypeDefinition> {
    await this.initCollection()

    const type: Omit<ProjectTypeDefinition, '_id'> = {
      ...typeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.collection.insertOne(type)
    return { _id: result.insertedId.toString(), ...type }
  }

  async findById(id: string): Promise<ProjectTypeDefinition | null> {
    await this.initCollection()
    const type = await this.collection.findOne({ _id: new ObjectId(id) })
    return type ? { ...type, _id: type._id.toString() } as ProjectTypeDefinition : null
  }

  async findAll(filter: Partial<ProjectTypeDefinition> = {}): Promise<ProjectTypeDefinition[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const types = await this.collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return types.map(type => ({ ...type, _id: type._id.toString() } as ProjectTypeDefinition))
  }

  async findActive(): Promise<ProjectTypeDefinition[]> {
    return this.findAll({ isActive: true })
  }

  async update(id: string, updateData: ProjectTypeDefinitionUpdate): Promise<ProjectTypeDefinition | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as ProjectTypeDefinition : null
  }

  async delete(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async search(query: string): Promise<ProjectTypeDefinition[]> {
    await this.initCollection()
    const regex = new RegExp(query, 'i')
    const types = await this.collection.find({
      $or: [
        { name: regex },
        { description: regex }
      ]
    }).sort({ createdAt: -1 }).toArray()

    return types.map(type => ({ ...type, _id: type._id.toString() } as ProjectTypeDefinition))
  }

  async getStats() {
    await this.initCollection()
    const pipeline = [
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]

    const stats = await this.collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id ? 'active' : 'inactive'] = stat.count
      return acc
    }, {} as Record<string, number>)
  }
}

export const projectTypeDefinitionModel = new ProjectTypeDefinitionModel() 