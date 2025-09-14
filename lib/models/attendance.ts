import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Attendance, AttendanceCreate, AttendanceUpdate, LeaveRequest, LeaveRequestCreate, LeaveRequestUpdate } from '../schemas/attendance'

export class AttendanceModel {
  private collection: Promise<Collection>
  private leaveRequestsCollection: Promise<Collection>

  constructor() {
    this.collection = this.initCollection('attendance')
    this.leaveRequestsCollection = this.initCollection('leave_requests')
  }

  private async initCollection(collectionName: string): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection(collectionName)
    
    if (collectionName === 'attendance') {
      // Create indexes for attendance
      await collection.createIndex({ userId: 1 })
      await collection.createIndex({ date: 1 })
      await collection.createIndex({ status: 1 })
      await collection.createIndex({ createdAt: -1 })
    } else if (collectionName === 'leave_requests') {
      // Create indexes for leave requests
      await collection.createIndex({ userId: 1 })
      await collection.createIndex({ status: 1 })
      await collection.createIndex({ startDate: 1 })
      await collection.createIndex({ endDate: 1 })
      await collection.createIndex({ createdAt: -1 })
    }

    return collection
  }

  // Attendance methods
  async createAttendance(attendanceData: AttendanceCreate): Promise<Attendance> {
    const collection = await this.collection
    
    const attendance: Omit<Attendance, '_id'> = {
      ...attendanceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(attendance)
    return { _id: result.insertedId.toString(), ...attendance }
  }

  async findAttendanceById(id: string): Promise<Attendance | null> {
    const collection = await this.collection
    const attendance = await collection.findOne({ _id: new ObjectId(id) })
    return attendance ? { ...attendance, _id: attendance._id.toString() } as Attendance : null
  }

  async findAttendanceByUser(userId: string): Promise<Attendance[]> {
    return this.findAllAttendance({ userId })
  }

  async findAllAttendance(filter: Partial<Attendance> = {}): Promise<Attendance[]> {
    const collection = await this.collection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const attendance = await collection.find(mongoFilter).sort({ date: -1 }).toArray()
    return attendance.map(record => ({ ...record, _id: record._id.toString() } as Attendance))
  }

  async findAttendanceByDate(date: Date): Promise<Attendance[]> {
    const collection = await this.collection
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const attendance = await collection.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).toArray()
    
    return attendance.map(record => ({ ...record, _id: record._id.toString() } as Attendance))
  }

  async findAttendanceByUserAndDate(userId: string, date: Date): Promise<Attendance | null> {
    const collection = await this.collection
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const attendance = await collection.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    })
    
    return attendance ? { ...attendance, _id: attendance._id.toString() } as Attendance : null
  }

  async updateAttendance(id: string, updateData: AttendanceUpdate): Promise<Attendance | null> {
    const collection = await this.collection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Attendance : null
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const collection = await this.collection
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getAttendanceStats(userId?: string) {
    const collection = await this.collection
    const matchStage = userId ? { userId } : {}
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
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

  // Leave Request methods
  async createLeaveRequest(leaveData: LeaveRequestCreate): Promise<LeaveRequest> {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    
    const leaveRequest: Omit<LeaveRequest, '_id'> = {
      ...leaveData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await leaveRequestsCollection.insertOne(leaveRequest)
    return { _id: result.insertedId.toString(), ...leaveRequest }
  }

  async findLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    const leaveRequest = await leaveRequestsCollection.findOne({ _id: new ObjectId(id) })
    return leaveRequest ? { ...leaveRequest, _id: leaveRequest._id.toString() } as LeaveRequest : null
  }

  async findLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]> {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    const leaveRequests = await leaveRequestsCollection.find({ userId }).sort({ createdAt: -1 }).toArray()
    return leaveRequests.map(request => ({ ...request, _id: request._id.toString() } as LeaveRequest))
  }

  async findAllLeaveRequests(filter: Partial<LeaveRequest> = {}): Promise<LeaveRequest[]> {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const leaveRequests = await leaveRequestsCollection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return leaveRequests.map(request => ({ ...request, _id: request._id.toString() } as LeaveRequest))
  }

  async findPendingLeaveRequests(): Promise<LeaveRequest[]> {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    const leaveRequests = await leaveRequestsCollection.find({ status: 'pending' }).sort({ createdAt: -1 }).toArray()
    return leaveRequests.map(request => ({ ...request, _id: request._id.toString() } as LeaveRequest))
  }

  async updateLeaveRequest(id: string, updateData: LeaveRequestUpdate): Promise<LeaveRequest | null> {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await leaveRequestsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as LeaveRequest : null
  }

  async deleteLeaveRequest(id: string): Promise<boolean> {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    const result = await leaveRequestsCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getLeaveRequestStats(userId?: string) {
    const leaveRequestsCollection = await this.leaveRequestsCollection
    const matchStage = userId ? { userId } : {}
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]
    
    const stats = await leaveRequestsCollection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {} as Record<string, number>)
  }
}

export const attendanceModel = new AttendanceModel() 