import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Client, ClientCreate, ClientUpdate } from '../schemas/client'

export class ClientModel {
  private collection!: Collection

  constructor() {
    // Don't initialize collection in constructor
  }

  private async initCollection() {
    if (this.collection) return
    
    const db = await getDatabase()
    this.collection = db.collection('clients')
    
    // Create indexes
    await this.collection.createIndex({ email: 1 })
    await this.collection.createIndex({ phone: 1 })
    await this.collection.createIndex({ status: 1 })
    await this.collection.createIndex({ assignedTo: 1 })
    await this.collection.createIndex({ createdAt: -1 })
  }

  async create(clientData: ClientCreate): Promise<Client> {
    await this.initCollection()
    
    const client: Omit<Client, '_id'> = {
      ...clientData,
      totalProjects: 0,
      totalRevenue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.collection.insertOne(client)
    return { _id: result.insertedId.toString(), ...client }
  }

  async findById(id: string): Promise<Client | null> {
    await this.initCollection()
    const client = await this.collection.findOne({ _id: new ObjectId(id) })
    return client ? { ...client, _id: client._id.toString() } as Client : null
  }

  async findByEmail(email: string): Promise<Client | null> {
    await this.initCollection()
    const client = await this.collection.findOne({ email })
    return client ? { ...client, _id: client._id.toString() } as Client : null
  }

  async findByPhone(phone: string): Promise<Client | null> {
    await this.initCollection()
    const client = await this.collection.findOne({ phone })
    return client ? { ...client, _id: client._id.toString() } as Client : null
  }

  async findAll(filter: Partial<Client> = {}): Promise<Client[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const clients = await this.collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return clients.map(client => ({ ...client, _id: client._id.toString() } as Client))
  }

  async findActive(): Promise<Client[]> {
    return this.findAll({ status: 'active' })
  }

  async findByStatus(status: string): Promise<Client[]> {
    return this.findAll({ status: status as any })
  }

  async findByAssignedTo(userId: string): Promise<Client[]> {
    return this.findAll({ assignedTo: userId })
  }

  async update(id: string, updateData: ClientUpdate): Promise<Client | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Client : null
  }

  async delete(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async updateStats(id: string, totalProjects: number, totalRevenue: number): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          totalProjects, 
          totalRevenue, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async search(query: string): Promise<Client[]> {
    await this.initCollection()
    const regex = new RegExp(query, 'i')
    const clients = await this.collection.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex },
        { company: regex },
        { contactPerson: regex }
      ]
    }).sort({ createdAt: -1 }).toArray()
    
    return clients.map(client => ({ ...client, _id: client._id.toString() } as Client))
  }

  async getStats() {
    await this.initCollection()
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      }
    ]
    
    const stats = await this.collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, revenue: stat.totalRevenue }
      return acc
    }, {} as Record<string, { count: number; revenue: number }>)
  }

  async getRecentClients(limit: number = 10): Promise<Client[]> {
    await this.initCollection()
    const clients = await this.collection.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return clients.map(client => ({ ...client, _id: client._id.toString() } as Client))
  }

  async countByStatus(status: string): Promise<number> {
    await this.initCollection()
    return this.collection.countDocuments({ status: status as any })
  }

  async getTotalRevenue(): Promise<number> {
    await this.initCollection()
    const result = await this.collection.aggregate([
      { $group: { _id: null, total: { $sum: '$totalRevenue' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }
}

export const clientModel = new ClientModel() 