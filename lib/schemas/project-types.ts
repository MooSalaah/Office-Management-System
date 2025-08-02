import { z } from "zod"

export const ProjectTypeDefinitionSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, "اسم نوع المشروع يجب أن يكون على الأقل حرفين"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const ProjectTypeDefinitionCreateSchema = ProjectTypeDefinitionSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true
})

export const ProjectTypeDefinitionUpdateSchema = ProjectTypeDefinitionSchema.partial().omit({
  _id: true,
  createdAt: true
})

export type ProjectTypeDefinition = z.infer<typeof ProjectTypeDefinitionSchema>
export type ProjectTypeDefinitionCreate = z.infer<typeof ProjectTypeDefinitionCreateSchema>
export type ProjectTypeDefinitionUpdate = z.infer<typeof ProjectTypeDefinitionUpdateSchema> 