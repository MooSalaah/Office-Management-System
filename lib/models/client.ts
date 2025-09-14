import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Client, ClientCreate, ClientUpdate } from '../schemas/client'

export class ClientModel {
  private collection: Promise<Collection>

  constructor() {
    this.collection = this.initCollection()
  }

  private async initCollection(): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection('clients')
    
    // Create indexes
    await collection.createIndex({ email: 1 })
    await collection.createIndex({ phone: 1 })
    await collection.createIndex({ status: 1 })
    await collection.createIndex({ assignedTo: 1 })
    await collection.createIndex({ createdAt: -1 })

    return collection
  }

  async create(clientData: ClientCreate): Promise<Client> {
    const collection = await this.collection
    
    const client: Omit<Client, '_id'> = {
      ...clientData,
      totalProjects: 0,
      totalRevenue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(client)
    return { _id: result.insertedId.toString(), ...client }
  }

  async findById(id: string): Promise<Client | null> {
    const collection = await this.collection
    const client = await collection.findOne({ _id: new ObjectId(id) })
    return client ? { ...client, _id: client._id.toString() } as Client : null
  }

  async findByEmail(email: string): Promise<Client | null> {
    const collection = await this.collection
    const client = await collection.findOne({ email })
    return client ? { ...client, _id: client._id.toString() } as Client : null
  }

  async findByPhone(phone: string): Promise<Client | null> {
    const collection = await this.collection
    const client = await collection.findOne({ phone })
    return client ? { ...client, _id: client._id.toString() } as Client : null
  }

  async findAll(filter: Partial<Client> = {}): Promise<Client[]> {
    const collection = await this.collection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const clients = await collection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
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
    const collection = await this.collection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Client : null
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async updateStats(id: string, totalProjects: number, totalRevenue: number): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
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
    const collection = await this.collection
    const regex = new RegExp(query, 'i')
    const clients = await collection.find({
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
    const collection = await this.collection
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      }
    ]
    
    const stats = await collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, revenue: stat.totalRevenue }
      return acc
    }, {} as Record<string, { count: number; revenue: number }>)
  }

  async getRecentClients(limit: number = 10): Promise<Client[]> {
    const collection = await this.collection
    const clients = await collection.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return clients.map(client => ({ ...client, _id: client._id.toString() } as Client))
  }

  async countByStatus(status: string): Promise<number> {
    const collection = await this.collection
    return collection.countDocuments({ status: status as any })
  }

  async getTotalRevenue(): Promise<number> {
    const collection = await this.collection
    const result = await collection.aggregate([
      { $group: { _id: null, total: { $sum: '$totalRevenue' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }
}

export const clientModel = new ClientModel() 