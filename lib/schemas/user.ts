import { z } from "zod"

export const UserRoleSchema = z.enum(["admin", "engineer", "accountant", "hr", "employee"])

export const UserSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"),
  role: UserRoleSchema,
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  salary: z.number().positive().optional(),
  hireDate: z.date().optional(),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const UserUpdateSchema = UserSchema.partial().omit({ 
  _id: true, 
  password: true, 
  createdAt: true 
})

export const UserLoginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

export const UserRegisterSchema = UserSchema.omit({ 
  _id: true, 
  isActive: true, 
  lastLogin: true, 
  createdAt: true, 
  updatedAt: true 
})

export const UserCreateSchema = UserRegisterSchema

export type User = z.infer<typeof UserSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type UserLogin = z.infer<typeof UserLoginSchema>
export type UserRegister = z.infer<typeof UserRegisterSchema>
export type UserCreate = z.infer<typeof UserCreateSchema> 