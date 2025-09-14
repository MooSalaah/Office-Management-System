import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { User, UserCreate, UserUpdate, UserLogin } from '../schemas/user'
import bcrypt from 'bcryptjs'

export class UserModel {
  private collection: Promise<Collection>

  constructor() {
    this.collection = this.initCollection()
  }

  private async initCollection(): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection('users')
    
    // Create indexes
    await collection.createIndex({ email: 1 }, { unique: true })
    await collection.createIndex({ role: 1 })
    await collection.createIndex({ isActive: 1 })

    return collection
  }

  async create(userData: UserCreate): Promise<User> {
    const collection = await this.collection
    
    const { password, ...rest } = userData
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const user: Omit<User, '_id'> = {
      ...rest,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(user)
    return { _id: result.insertedId.toString(), ...user }
  }

  async findById(id: string): Promise<User | null> {
    const collection = await this.collection
    const user = await collection.findOne({ _id: new ObjectId(id) })
    return user ? { ...user, _id: user._id.toString() } as User : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.collection
    const user = await collection.findOne({ email })
    return user ? { ...user, _id: user._id.toString() } as User : null
  }

  async findAll(filter: Partial<User> = {}): Promise<User[]> {
    const collection = await this.collection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const users = await collection.find(mongoFilter).toArray()
    return users.map(user => ({ ...user, _id: user._id.toString() } as User))
  }

  async search(query: string): Promise<User[]> {
    const collection = await this.collection
    const users = await collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { role: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { position: { $regex: query, $options: 'i' } }
      ]
    }).toArray()
    return users.map(user => ({ ...user, _id: user._id.toString() } as User))
  }

  async findActive(): Promise<User[]> {
    return this.findAll({ isActive: true })
  }

  async findByRole(role: string): Promise<User[]> {
    return this.findAll({ role: role as any, isActive: true })
  }

  async update(id: string, updateData: UserUpdate): Promise<User | null> {
    const collection = await this.collection
    const update: any = { ...updateData, updatedAt: new Date() }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as User : null
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async softDelete(id: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    )
    return result.modifiedCount > 0
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user || !user.isActive) return null

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) return null

    // Update last login
    await this.update(user._id!, { lastLogin: new Date() })

    return user
  }

  async updateLastLogin(id: string): Promise<void> {
    const collection = await this.collection
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    )
  }

  async countByRole(role: string): Promise<number> {
    const collection = await this.collection
    return collection.countDocuments({ role: role as any, isActive: true })
  }

  async getStats() {
    const collection = await this.collection
    const pipeline = [
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
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
}

export const userModel = new UserModel() 