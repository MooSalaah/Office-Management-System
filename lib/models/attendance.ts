import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Attendance, AttendanceCreate, AttendanceUpdate, LeaveRequest, LeaveRequestCreate, LeaveRequestUpdate } from '../schemas/attendance'

export class AttendanceModel {
  private collection!: Collection
  private leaveRequestsCollection!: Collection

  constructor() {
    // Don't initialize collection in constructor
  }

  private async initCollection() {
    if (this.collection) return
    
    const db = await getDatabase()
    this.collection = db.collection('attendance')
    this.leaveRequestsCollection = db.collection('leave_requests')
    
    // Create indexes for attendance
    await this.collection.createIndex({ userId: 1 })
    await this.collection.createIndex({ date: 1 })
    await this.collection.createIndex({ status: 1 })
    await this.collection.createIndex({ createdAt: -1 })
    
    // Create indexes for leave requests
    await this.leaveRequestsCollection.createIndex({ userId: 1 })
    await this.leaveRequestsCollection.createIndex({ status: 1 })
    await this.leaveRequestsCollection.createIndex({ startDate: 1 })
    await this.leaveRequestsCollection.createIndex({ endDate: 1 })
    await this.leaveRequestsCollection.createIndex({ createdAt: -1 })
  }

  // Attendance methods
  async createAttendance(attendanceData: AttendanceCreate): Promise<Attendance> {
    await this.initCollection()
    
    const attendance: Omit<Attendance, '_id'> = {
      ...attendanceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.collection.insertOne(attendance)
    return { _id: result.insertedId.toString(), ...attendance }
  }

  async findAttendanceById(id: string): Promise<Attendance | null> {
    await this.initCollection()
    const attendance = await this.collection.findOne({ _id: new ObjectId(id) })
    return attendance ? { ...attendance, _id: attendance._id.toString() } as Attendance : null
  }

  async findAttendanceByUser(userId: string): Promise<Attendance[]> {
    return this.findAllAttendance({ userId })
  }

  async findAllAttendance(filter: Partial<Attendance> = {}): Promise<Attendance[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const attendance = await this.collection.find(mongoFilter).sort({ date: -1 }).toArray()
    return attendance.map(record => ({ ...record, _id: record._id.toString() } as Attendance))
  }

  async findAttendanceByDate(date: Date): Promise<Attendance[]> {
    await this.initCollection()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const attendance = await this.collection.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).toArray()
    
    return attendance.map(record => ({ ...record, _id: record._id.toString() } as Attendance))
  }

  async findAttendanceByUserAndDate(userId: string, date: Date): Promise<Attendance | null> {
    await this.initCollection()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const attendance = await this.collection.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    })
    
    return attendance ? { ...attendance, _id: attendance._id.toString() } as Attendance : null
  }

  async updateAttendance(id: string, updateData: AttendanceUpdate): Promise<Attendance | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Attendance : null
  }

  async deleteAttendance(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getAttendanceStats(userId?: string) {
    await this.initCollection()
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
    
    const stats = await this.collection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {} as Record<string, number>)
  }

  // Leave Request methods
  async createLeaveRequest(leaveData: LeaveRequestCreate): Promise<LeaveRequest> {
    await this.initCollection()
    
    const leaveRequest: Omit<LeaveRequest, '_id'> = {
      ...leaveData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.leaveRequestsCollection.insertOne(leaveRequest)
    return { _id: result.insertedId.toString(), ...leaveRequest }
  }

  async findLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    await this.initCollection()
    const leaveRequest = await this.leaveRequestsCollection.findOne({ _id: new ObjectId(id) })
    return leaveRequest ? { ...leaveRequest, _id: leaveRequest._id.toString() } as LeaveRequest : null
  }

  async findLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]> {
    await this.initCollection()
    const leaveRequests = await this.leaveRequestsCollection.find({ userId }).sort({ createdAt: -1 }).toArray()
    return leaveRequests.map(request => ({ ...request, _id: request._id.toString() } as LeaveRequest))
  }

  async findAllLeaveRequests(filter: Partial<LeaveRequest> = {}): Promise<LeaveRequest[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const leaveRequests = await this.leaveRequestsCollection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return leaveRequests.map(request => ({ ...request, _id: request._id.toString() } as LeaveRequest))
  }

  async findPendingLeaveRequests(): Promise<LeaveRequest[]> {
    await this.initCollection()
    const leaveRequests = await this.leaveRequestsCollection.find({ status: 'pending' }).sort({ createdAt: -1 }).toArray()
    return leaveRequests.map(request => ({ ...request, _id: request._id.toString() } as LeaveRequest))
  }

  async updateLeaveRequest(id: string, updateData: LeaveRequestUpdate): Promise<LeaveRequest | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.leaveRequestsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as LeaveRequest : null
  }

  async deleteLeaveRequest(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.leaveRequestsCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getLeaveRequestStats(userId?: string) {
    await this.initCollection()
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
    
    const stats = await this.leaveRequestsCollection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {} as Record<string, number>)
  }
}

export const attendanceModel = new AttendanceModel() 