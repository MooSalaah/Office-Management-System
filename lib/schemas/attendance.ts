import { z } from "zod"

export const AttendanceStatusSchema = z.enum(["present", "absent", "late", "half-day", "leave", "sick-leave"])

export const AttendanceSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Reference to User
  date: z.date(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  status: AttendanceStatusSchema,
  workHours: z.number().min(0).max(24).default(0),
  overtimeHours: z.number().min(0).default(0),
  notes: z.string().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  recordedBy: z.string().optional(), // User ID (for manual entries)
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const AttendanceUpdateSchema = AttendanceSchema.partial().omit({ 
  _id: true, 
  userId: true, 
  date: true, 
  createdAt: true 
})

export const AttendanceCreateSchema = AttendanceSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const LeaveRequestSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Reference to User
  type: z.enum(["annual", "sick", "emergency", "other"]),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().min(10, "سبب الإجازة يجب أن يكون على الأقل 10 أحرف"),
  status: z.enum(["pending", "approved", "rejected"]),
  approvedBy: z.string().optional(), // User ID
  approvedAt: z.date().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const LeaveRequestUpdateSchema = LeaveRequestSchema.partial().omit({ 
  _id: true, 
  userId: true, 
  createdAt: true 
})

export const LeaveRequestCreateSchema = LeaveRequestSchema.omit({ 
  _id: true, 
  approvedBy: true, 
  approvedAt: true, 
  createdAt: true, 
  updatedAt: true 
})

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>
export type AttendanceUpdate = z.infer<typeof AttendanceUpdateSchema>
export type AttendanceCreate = z.infer<typeof AttendanceCreateSchema>
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>
export type LeaveRequestUpdate = z.infer<typeof LeaveRequestUpdateSchema>
export type LeaveRequestCreate = z.infer<typeof LeaveRequestCreateSchema> 