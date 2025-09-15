import { z } from "zod"

export const UserProfileSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Reference to User
  firstName: z.string().min(2, "الاسم الأول يجب أن يكون على الأقل حرفين"),
  lastName: z.string().min(2, "اسم العائلة يجب أن يكون على الأقل حرفين"),
  displayName: z.string().optional(),
  avatar: z.string().url().optional(),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام").optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  role: z.enum(["admin", "engineer", "accountant", "hr", "employee"]),
  salary: z.number().positive().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("المملكة العربية السعودية"),
  preferences: z.object({
    language: z.enum(["ar", "en"]).default("ar"),
    theme: z.enum(["light", "dark", "auto"]).default("light"),
    timezone: z.string().default("Asia/Riyadh"),
    dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).default("DD/MM/YYYY"),
    timeFormat: z.enum(["12h", "24h"]).default("24h"),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    }).default({
      email: true,
      push: true,
      sms: false,
    }),
  }).default({
    language: "ar",
    theme: "light",
    timezone: "Asia/Riyadh",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  }),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const UserProfileUpdateSchema = UserProfileSchema.partial().omit({ 
  _id: true, 
  userId: true, 
  createdAt: true 
})

export const UserProfileCreateSchema = UserProfileSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
})

export type UserProfile = z.infer<typeof UserProfileSchema>
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>
export type UserProfileCreate = z.infer<typeof UserProfileCreateSchema> 