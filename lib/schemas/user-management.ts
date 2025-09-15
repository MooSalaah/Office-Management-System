import { z } from "zod"

export const PermissionSchema = z.enum([
  // User Management
  "users.view",
  "users.create", 
  "users.edit",
  "users.delete",
  "users.activate",
  "users.deactivate",
  
  // Client Management
  "clients.view",
  "clients.create",
  "clients.edit", 
  "clients.delete",
  
  // Project Management
  "projects.view",
  "projects.create",
  "projects.edit",
  "projects.delete",
  "projects.assign",
  
  // Task Management
  "tasks.view",
  "tasks.create",
  "tasks.edit",
  "tasks.delete",
  "tasks.assign",
  
  // Finance Management
  "finance.view",
  "finance.create",
  "finance.edit",
  "finance.delete",
  "finance.approve",
  
  // Attendance Management
  "attendance.view",
  "attendance.create",
  "attendance.edit",
  "attendance.delete",
  "attendance.approve",
  
  // System Settings
  "settings.view",
  "settings.edit",
  "settings.company",
  "settings.security",
  
  // Reports
  "reports.view",
  "reports.export",
  
  // Dashboard
  "dashboard.view",
  "dashboard.admin",
])

export const RoleSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, "اسم الدور يجب أن يكون على الأقل حرفين"),
  description: z.string().optional(),
  permissions: z.array(PermissionSchema).default([]),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdBy: z.string(), // User ID
  updatedBy: z.string().optional(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const UserRoleAssignmentSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Reference to User
  roleId: z.string(), // Reference to Role
  assignedBy: z.string(), // User ID
  assignedAt: z.date().default(() => new Date()),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
})

export const UserActivitySchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Reference to User
  action: z.string(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
})

export const UserSessionSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Reference to User
  sessionId: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  loginTime: z.date(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean().default(true),
  logoutTime: z.date().optional(),
})

export const RoleUpdateSchema = RoleSchema.partial().omit({ 
  _id: true, 
  createdBy: true, 
  createdAt: true 
})

export const RoleCreateSchema = RoleSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const UserRoleAssignmentUpdateSchema = UserRoleAssignmentSchema.partial().omit({ 
  _id: true, 
  assignedBy: true, 
  assignedAt: true 
})

export const UserRoleAssignmentCreateSchema = UserRoleAssignmentSchema.omit({ 
  _id: true, 
  assignedAt: true 
})

export type Permission = z.infer<typeof PermissionSchema>
export type Role = z.infer<typeof RoleSchema>
export type UserRoleAssignment = z.infer<typeof UserRoleAssignmentSchema>
export type UserActivity = z.infer<typeof UserActivitySchema>
export type UserSession = z.infer<typeof UserSessionSchema>
export type RoleUpdate = z.infer<typeof RoleUpdateSchema>
export type RoleCreate = z.infer<typeof RoleCreateSchema>
export type UserRoleAssignmentUpdate = z.infer<typeof UserRoleAssignmentUpdateSchema>
export type UserRoleAssignmentCreate = z.infer<typeof UserRoleAssignmentCreateSchema> 