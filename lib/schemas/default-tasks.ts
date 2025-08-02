import { z } from "zod"

export const DefaultTaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "عنوان المهمة يجب أن يكون على الأقل 3 أحرف"),
  description: z.string().optional(),
  category: z.enum([
    "architectural",
    "structural", 
    "electrical",
    "mechanical",
    "plumbing",
    "safety",
    "permits",
    "supervision",
    "other"
  ]),
  estimatedHours: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const DefaultTaskCreateSchema = DefaultTaskSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true
})

export const DefaultTaskUpdateSchema = DefaultTaskSchema.partial().omit({
  _id: true,
  createdAt: true
})

export type DefaultTask = z.infer<typeof DefaultTaskSchema>
export type DefaultTaskCreate = z.infer<typeof DefaultTaskCreateSchema>
export type DefaultTaskUpdate = z.infer<typeof DefaultTaskUpdateSchema> 