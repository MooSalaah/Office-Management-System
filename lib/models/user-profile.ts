import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { UserProfile, UserProfileCreate, UserProfileUpdate } from '../schemas/user-profile'

export class UserProfileModel {
  private collection: Promise<Collection>

  constructor() {
    this.collection = this.initCollection()
  }

  private async initCollection(): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection('user_profiles')
    
    // Create indexes
    await collection.createIndex({ userId: 1 }, { unique: true })
    await collection.createIndex({ email: 1 })
    await collection.createIndex({ role: 1 })
    await collection.createIndex({ department: 1 })
    await collection.createIndex({ "preferences.language": 1 })
    await collection.createIndex({ "preferences.theme": 1 })

    return collection
  }

  async create(profileData: UserProfileCreate): Promise<UserProfile> {
    const collection = await this.collection
    
    const profile: Omit<UserProfile, '_id'> = {
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(profile)
    return { _id: result.insertedId.toString(), ...profile }
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const collection = await this.collection
    const profile = await collection.findOne({ userId })
    return profile ? { ...profile, _id: profile._id.toString() } as UserProfile : null
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const collection = await this.collection
    const profile = await collection.findOne({ email })
    return profile ? { ...profile, _id: profile._id.toString() } as UserProfile : null
  }

  async findById(id: string): Promise<UserProfile | null> {
    const collection = await this.collection
    const profile = await collection.findOne({ _id: new ObjectId(id) })
    return profile ? { ...profile, _id: profile._id.toString() } as UserProfile : null
  }

  async findAll(filter: Partial<UserProfile> = {}): Promise<UserProfile[]> {
    const collection = await this.collection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const profiles = await collection.find(mongoFilter).toArray()
    return profiles.map(profile => ({ ...profile, _id: profile._id.toString() } as UserProfile))
  }

  async update(userId: string, updateData: UserProfileUpdate): Promise<UserProfile | null> {
    const collection = await this.collection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await collection.findOneAndUpdate(
      { userId },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as UserProfile : null
  }

  async updatePreferences(userId: string, preferences: any): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
      { userId },
      { 
        $set: { 
          "preferences": preferences, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateBasicInfo(userId: string, basicInfo: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
  }): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
      { userId },
      { 
        $set: { 
          ...basicInfo,
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateWorkInfo(userId: string, workInfo: {
    role?: string;
    department?: string;
    position?: string;
    salary?: number;
  }): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
      { userId },
      { 
        $set: { 
          ...workInfo,
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async delete(userId: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.deleteOne({ userId })
    return result.deletedCount > 0
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.updateOne(
      { userId },
      { 
        $set: { 
          avatar: avatarUrl, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async getUsersByRole(role: string): Promise<UserProfile[]> {
    const collection = await this.collection
    const profiles = await collection.find({ role }).toArray()
    return profiles.map(profile => ({ ...profile, _id: profile._id.toString() } as UserProfile))
  }

  async getUsersByDepartment(department: string): Promise<UserProfile[]> {
    const collection = await this.collection
    const profiles = await collection.find({ department }).toArray()
    return profiles.map(profile => ({ ...profile, _id: profile._id.toString() } as UserProfile))
  }

  async getUsersByLanguage(language: string): Promise<UserProfile[]> {
    const collection = await this.collection
    const profiles = await collection.find({
      "preferences.language": language
    }).toArray()
    return profiles.map(profile => ({ ...profile, _id: profile._id.toString() } as UserProfile))
  }

  async getUsersByTheme(theme: string): Promise<UserProfile[]> {
    const collection = await this.collection
    const profiles = await collection.find({
      "preferences.theme": theme
    }).toArray()
    return profiles.map(profile => ({ ...profile, _id: profile._id.toString() } as UserProfile))
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    const collection = await this.collection
    const profiles = await collection.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { position: { $regex: query, $options: 'i' } }
      ]
    }).toArray()
    return profiles.map(profile => ({ ...profile, _id: profile._id.toString() } as UserProfile))
  }
}

export const userProfileModel = new UserProfileModel() 