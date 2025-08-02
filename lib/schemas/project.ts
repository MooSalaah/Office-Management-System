import { z } from "zod"

export const ProjectStatusSchema = z.enum(["new", "in-progress", "completed", "on-hold", "cancelled"])
export const ProjectTypeSchema = z.enum(["residential", "commercial", "industrial", "infrastructure", "other"])

export const ProjectSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "عنوان المشروع يجب أن يكون على الأقل 3 أحرف"),
  description: z.string().optional(),
  clientId: z.string(), // Reference to Client
  type: ProjectTypeSchema,
  status: ProjectStatusSchema,
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estimatedEndDate: z.date().optional(),
  budget: z.number().positive().optional(),
  actualCost: z.number().default(0),
  progress: z.number().min(0).max(100).default(0),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  assignedTo: z.array(z.string()).default([]), // Array of User IDs
  projectManager: z.string().optional(), // User ID
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).default([]),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const ProjectUpdateSchema = ProjectSchema.partial().omit({ 
  _id: true, 
  createdAt: true 
})

export const ProjectCreateSchema = ProjectSchema.omit({ 
  _id: true, 
  actualCost: true, 
  progress: true, 
  createdAt: true, 
  updatedAt: true 
})

export type Project = z.infer<typeof ProjectSchema>
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>
export type ProjectType = z.infer<typeof ProjectTypeSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>
export type ProjectCreate = z.infer<typeof ProjectCreateSchema> 