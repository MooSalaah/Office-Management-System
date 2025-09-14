import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Project, ProjectCreate, ProjectUpdate } from '../schemas/project'

export class ProjectModel {
  private collection: Promise<Collection>

  constructor() {
    this.collection = this.initCollection()
  }

  private async initCollection(): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection('projects')
    
    // Create indexes
    await collection.createIndex({ clientId: 1 })
    await collection.createIndex({ status: 1 })
    await collection.createIndex({ type: 1 })
    await collection.createIndex({ assignedTo: 1 })
    await collection.createIndex({ projectManager: 1 })
    await collection.createIndex({ createdAt: -1 })
    await collection.createIndex({ startDate: 1 })
    await collection.createIndex({ endDate: 1 })

    return collection
  }

  async create(projectData: ProjectCreate): Promise<Project> {
    const collection = await this.collection
    
    const project: Omit<Project, '_id'> = {
      ...projectData,
      actualCost: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(project)
    return { _id: result.insertedId.toString(), ...project }
  }

  async findById(id: string): Promise<Project | null> {
    const collection = await this.collection
    const project = await collection.findOne({ _id: new ObjectId(id) })
    return project ? { ...project, _id: project._id.toString() } as Project : null
  }

  async findByClient(clientId: string): Promise<Project[]> {
    return this.findAll({ clientId })
  }

  async findAll(filter: Partial<Project> = {}): Promise<Project[]> {
    const collection = await this.collection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const projects = await collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return projects.map(project => ({ ...project, _id: project._id.toString() } as Project))
  }

  async findActive(): Promise<Project[]> {
    const collection = await this.collection
    const projects = await collection.find({
      status: { $in: ['new', 'in-progress'] }
    }).sort({ createdAt: -1 }).toArray()
    return projects.map(project => ({ ...project, _id: project._id.toString() } as Project))
  }

  async findByStatus(status: string): Promise<Project[]> {
    return this.findAll({ status: status as any })
  }

  async findByType(type: string): Promise<Project[]> {
    return this.findAll({ type: type as any })
  }

  async findByAssignedTo(userId: string): Promise<Project[]> {
    const collection = await this.collection
    const projects = await collection.find({
      assignedTo: { $in: [userId] }
    }).sort({ createdAt: -1 }).toArray()
    return projects.map(project => ({ ...project, _id: project._id.toString() } as Project))
  }

  async findByProjectManager(userId: string): Promise<Project[]> {
    return this.findAll({ projectManager: userId })
  }

  async update(id: string, updateData: ProjectUpdate): Promise<Project | null> {
    const collection = await this.collection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Project : null
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

  async updateProgressFromTasks(projectId: string, completedTasks: number, totalTasks: number): Promise<boolean> {
    const collection = await this.collection
    
    if (totalTasks === 0) {
      return this.updateProgress(projectId, 0)
    }

    const progress = Math.round((completedTasks / totalTasks) * 100)
    return this.updateProgress(projectId, progress)
  }

  async updateCost(id: string, actualCost: number): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          actualCost, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async search(query: string): Promise<Project[]> {
    const collection = await this.collection
    const regex = new RegExp(query, 'i')
    const projects = await collection.find({
      $or: [
        { title: regex },
        { description: regex },
        { location: regex },
        { address: regex },
        { city: regex },
        { tags: { $in: [regex] } }
      ]
    }).sort({ createdAt: -1 }).toArray()
    
    return projects.map(project => ({ ...project, _id: project._id.toString() } as Project))
  }

  async getStats() {
    const collection = await this.collection
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalActualCost: { $sum: '$actualCost' }
        }
      }
    ]
    
    const stats = await collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = { 
        count: stat.count, 
        budget: stat.totalBudget || 0, 
        actualCost: stat.totalActualCost || 0 
      }
      return acc
    }, {} as Record<string, { count: number; budget: number; actualCost: number }>)
  }

  async getTypeStats() {
    const collection = await this.collection
    const pipeline = [
      {
        $group: {
          _id: '$type',
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

  async getRecentProjects(limit: number = 10): Promise<Project[]> {
    const collection = await this.collection
    const projects = await collection.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return projects.map(project => ({ ...project, _id: project._id.toString() } as Project))
  }

  async getOverdueProjects(): Promise<Project[]> {
    const collection = await this.collection
    const today = new Date()
    const projects = await collection.find({
      estimatedEndDate: { $lt: today },
      status: { $in: ['new', 'in-progress'] }
    }).toArray()
    
    return projects.map(project => ({ ...project, _id: project._id.toString() } as Project))
  }

  async countByStatus(status: string): Promise<number> {
    const collection = await this.collection
    return collection.countDocuments({ status: status as any })
  }

  async countByType(type: string): Promise<number> {
    const collection = await this.collection
    return collection.countDocuments({ type: type as any })
  }

  async getTotalBudget(): Promise<number> {
    const collection = await this.collection
    const result = await collection.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }

  async getTotalActualCost(): Promise<number> {
    const collection = await this.collection
    const result = await collection.aggregate([
      { $group: { _id: null, total: { $sum: '$actualCost' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }
}

export const projectModel = new ProjectModel() 