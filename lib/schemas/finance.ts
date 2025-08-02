import { z } from "zod"

export const TransactionTypeSchema = z.enum(["income", "expense"])
export const TransactionCategorySchema = z.enum([
  "project_revenue",
  "consultation_fees",
  "design_fees",
  "construction_supervision",
  "salaries",
  "office_expenses",
  "equipment",
  "marketing",
  "utilities",
  "rent",
  "insurance",
  "taxes",
  "other"
])

export const PaymentMethodSchema = z.enum(["cash", "bank_transfer", "check", "credit_card", "online"])

export const TransactionSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "عنوان المعاملة يجب أن يكون على الأقل 3 أحرف"),
  description: z.string().optional(),
  type: TransactionTypeSchema,
  category: TransactionCategorySchema,
  amount: z.number().positive("المبلغ يجب أن يكون موجب"),
  currency: z.string().default("SAR"),
  paymentMethod: PaymentMethodSchema.optional(),
  projectId: z.string().optional(), // Reference to Project
  clientId: z.string().optional(), // Reference to Client
  invoiceNumber: z.string().optional(),
  receiptNumber: z.string().optional(),
  transactionDate: z.date(),
  dueDate: z.date().optional(),
  status: z.enum(["pending", "completed", "cancelled", "overdue"]),
  recordedBy: z.string(), // User ID
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

export const TransactionUpdateSchema = TransactionSchema.partial().omit({ 
  _id: true, 
  recordedBy: true, 
  createdAt: true 
})

export const TransactionCreateSchema = TransactionSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const InvoiceSchema = z.object({
  _id: z.string().optional(),
  invoiceNumber: z.string(),
  clientId: z.string(),
  projectId: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    total: z.number().positive(),
  })),
  subtotal: z.number().positive(),
  tax: z.number().default(0),
  total: z.number().positive(),
  issueDate: z.date(),
  dueDate: z.date(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const InvoiceUpdateSchema = InvoiceSchema.partial().omit({ 
  _id: true, 
  createdAt: true 
})

export const InvoiceCreateSchema = InvoiceSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
})

export type Transaction = z.infer<typeof TransactionSchema>
export type TransactionType = z.infer<typeof TransactionTypeSchema>
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type TransactionUpdate = z.infer<typeof TransactionUpdateSchema>
export type TransactionCreate = z.infer<typeof TransactionCreateSchema>
export type Invoice = z.infer<typeof InvoiceSchema>
export type InvoiceUpdate = z.infer<typeof InvoiceUpdateSchema>
export type InvoiceCreate = z.infer<typeof InvoiceCreateSchema> 