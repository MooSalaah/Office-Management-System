import { z } from "zod"

export const CompanySettingsSchema = z.object({
  _id: z.string().optional(),
  companyName: z.string().min(2, "اسم الشركة يجب أن يكون على الأقل حرفين"),
  companyNameEn: z.string().optional(),
  logo: z.string().url().optional(),
  stamp: z.string().url().optional(), // الختم
  signature: z.string().url().optional(), // التوقيع
  description: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام"),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default("المملكة العربية السعودية"),
  }),
  workingHours: z.object({
    startTime: z.string().default("08:00"),
    endTime: z.string().default("17:00"),
    workDays: z.array(z.number()).default([0, 1, 2, 3, 4]), // Sunday to Thursday
    weekendDays: z.array(z.number()).default([5, 6]), // Friday, Saturday
  }).default({}),
  systemSettings: z.object({
    defaultLanguage: z.enum(["ar", "en"]).default("ar"),
    defaultTimezone: z.string().default("Asia/Riyadh"),
    dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).default("DD/MM/YYYY"),
    timeFormat: z.enum(["12h", "24h"]).default("24h"),
    currency: z.string().default("SAR"),
    currencySymbol: z.string().default("ر.س"),
    decimalPlaces: z.number().default(2),
  }).default({}),
  createdBy: z.string(), // User ID
  updatedBy: z.string().optional(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const CompanySettingsUpdateSchema = CompanySettingsSchema.partial().omit({ 
  _id: true, 
  createdBy: true, 
  createdAt: true 
})

export const CompanySettingsCreateSchema = CompanySettingsSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
})

export type CompanySettings = z.infer<typeof CompanySettingsSchema>
export type CompanySettingsUpdate = z.infer<typeof CompanySettingsUpdateSchema>
export type CompanySettingsCreate = z.infer<typeof CompanySettingsCreateSchema> 