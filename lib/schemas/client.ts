import { z } from "zod"

export const ClientStatusSchema = z.enum(["active", "inactive", "prospect"])

export const ClientSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, "اسم العميل يجب أن يكون على الأقل حرفين"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("المملكة العربية السعودية"),
  company: z.string().optional(),
  contactPerson: z.string().optional(),
  status: ClientStatusSchema,
  notes: z.string().optional(),
  totalProjects: z.number().default(0),
  totalRevenue: z.number().default(0),
  assignedTo: z.string().optional(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const ClientUpdateSchema = ClientSchema.partial().omit({ 
  _id: true, 
  totalProjects: true, 
  totalRevenue: true, 
  createdAt: true 
})

export const ClientCreateSchema = ClientSchema.omit({ 
  _id: true, 
  totalProjects: true, 
  totalRevenue: true, 
  createdAt: true, 
  updatedAt: true 
})

export type Client = z.infer<typeof ClientSchema>
export type ClientStatus = z.infer<typeof ClientStatusSchema>
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>
export type ClientCreate = z.infer<typeof ClientCreateSchema> 