import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { ProjectTypeDefinition, ProjectTypeDefinitionCreate, ProjectTypeDefinitionUpdate } from '../schemas/project-types'

export class ProjectTypeDefinitionModel {
  private collection: Promise<Collection>

  constructor() {
    this.collection = this.initCollection()
  }

  private async initCollection(): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection('project_types')

    // Create indexes
    await collection.createIndex({ name: 1 })
    await collection.createIndex({ isActive: 1 })
    await collection.createIndex({ createdAt: -1 })

    return collection
  }

  async create(typeData: ProjectTypeDefinitionCreate): Promise<ProjectTypeDefinition> {
    const collection = await this.collection

    const type: Omit<ProjectTypeDefinition, '_id'> = {
      ...typeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(type)
    return { _id: result.insertedId.toString(), ...type }
  }

  async findById(id: string): Promise<ProjectTypeDefinition | null> {
    const collection = await this.collection
    const type = await collection.findOne({ _id: new ObjectId(id) })
    return type ? { ...type, _id: type._id.toString() } as ProjectTypeDefinition : null
  }

  async findAll(filter: Partial<ProjectTypeDefinition> = {}): Promise<ProjectTypeDefinition[]> {
    const collection = await this.collection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const types = await collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return types.map(type => ({ ...type, _id: type._id.toString() } as ProjectTypeDefinition))
  }

  async findActive(): Promise<ProjectTypeDefinition[]> {
    return this.findAll({ isActive: true })
  }

  async update(id: string, updateData: ProjectTypeDefinitionUpdate): Promise<ProjectTypeDefinition | null> {
    const collection = await this.collection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as ProjectTypeDefinition : null
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async search(query: string): Promise<ProjectTypeDefinition[]> {
    const collection = await this.collection
    const regex = new RegExp(query, 'i')
    const types = await collection.find({
      $or: [
        { name: regex },
        { description: regex }
      ]
    }).sort({ createdAt: -1 }).toArray()

    return types.map(type => ({ ...type, _id: type._id.toString() } as ProjectTypeDefinition))
  }

  async getStats() {
    const collection = await this.collection
    const pipeline = [
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]

    const stats = await collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id ? 'active' : 'inactive'] = stat.count
      return acc
    }, {} as Record<string, number>)
  }
}

export const projectTypeDefinitionModel = new ProjectTypeDefinitionModel() 