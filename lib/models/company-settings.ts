import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { CompanySettings, CompanySettingsCreate, CompanySettingsUpdate } from '../schemas/company-settings'

export class CompanySettingsModel {
  private collection!: Collection

  constructor() {
    // Don't initialize collection in constructor
  }

  private async initCollection() {
    if (this.collection) return
    
    const db = await getDatabase()
    this.collection = db.collection('company_settings')
    
    // Create indexes
    await this.collection.createIndex({ companyName: 1 })
    await this.collection.createIndex({ email: 1 })
    await this.collection.createIndex({ "systemSettings.defaultLanguage": 1 })
  }

  async create(settingsData: CompanySettingsCreate): Promise<CompanySettings> {
    await this.initCollection()
    
    const settings: Omit<CompanySettings, '_id'> = {
      ...settingsData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.collection.insertOne(settings)
    return { _id: result.insertedId.toString(), ...settings }
  }

  async findById(id: string): Promise<CompanySettings | null> {
    await this.initCollection()
    const settings = await this.collection.findOne({ _id: new ObjectId(id) })
    return settings ? { ...settings, _id: settings._id.toString() } as CompanySettings : null
  }

  async getCurrentSettings(): Promise<CompanySettings | null> {
    await this.initCollection()
    // Assuming there's only one company settings record
    const settings = await this.collection.findOne({})
    return settings ? { ...settings, _id: settings._id.toString() } as CompanySettings : null
  }

  async update(id: string, updateData: CompanySettingsUpdate): Promise<CompanySettings | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as CompanySettings : null
  }

  async updateCurrentSettings(updateData: CompanySettingsUpdate): Promise<CompanySettings | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.collection.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as CompanySettings : null
  }

  async updateBasicInfo(id: string, basicInfo: {
    companyName?: string;
    companyNameEn?: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
  }): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...basicInfo,
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateAddress(id: string, address: any): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          address, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateWorkingHours(id: string, workingHours: any): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          workingHours, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateSystemSettings(id: string, systemSettings: any): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          systemSettings, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateLogo(id: string, logoUrl: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          logo: logoUrl, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateStamp(id: string, stampUrl: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          stamp: stampUrl, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async updateSignature(id: string, signatureUrl: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          signature: signatureUrl, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async delete(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getSettingsByLanguage(language: string): Promise<CompanySettings[]> {
    await this.initCollection()
    const settings = await this.collection.find({
      "systemSettings.defaultLanguage": language
    }).toArray()
    return settings.map(setting => ({ ...setting, _id: setting._id.toString() } as CompanySettings))
  }
}

export const companySettingsModel = new CompanySettingsModel() 