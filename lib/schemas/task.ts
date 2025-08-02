import { z } from "zod"

export const TaskStatusSchema = z.enum(["new", "in-progress", "completed", "on-hold", "cancelled"])
export const TaskPrioritySchema = z.enum(["low", "medium", "high", "urgent"])

export const TaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "عنوان المهمة يجب أن يكون على الأقل 3 أحرف"),
  description: z.string().optional(),
  projectId: z.string().optional(), // Reference to Project (optional for standalone tasks)
  assignedTo: z.string(), // User ID
  assignedBy: z.string(), // User ID
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  completedDate: z.date().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().default(0),
  progress: z.number().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).default([]),
  comments: z.array(z.object({
    userId: z.string(),
    comment: z.string(),
    timestamp: z.date(),
  })).default([]),
  dependencies: z.array(z.string()).default([]), // Array of Task IDs
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const TaskUpdateSchema = TaskSchema.partial().omit({ 
  _id: true, 
  assignedBy: true, 
  createdAt: true 
})

export const TaskCreateSchema = TaskSchema.omit({ 
  _id: true, 
  actualHours: true, 
  progress: true, 
  completedDate: true, 
  comments: true, 
  createdAt: true, 
  updatedAt: true 
})

export const TaskCommentSchema = z.object({
  taskId: z.string(),
  comment: z.string().min(1, "التعليق مطلوب"),
})

export type Task = z.infer<typeof TaskSchema>
export type TaskStatus = z.infer<typeof TaskStatusSchema>
export type TaskPriority = z.infer<typeof TaskPrioritySchema>
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>
export type TaskCreate = z.infer<typeof TaskCreateSchema>
export type TaskComment = z.infer<typeof TaskCommentSchema> 