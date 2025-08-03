export const dynamic = "force-static"

import { NextRequest, NextResponse } from 'next/server'
import { TransactionCreateSchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const clientId = searchParams.get('clientId')
    
            const { financeModel } = await import('@/lib/models')
        let transactions
        if (type) {
          transactions = await financeModel.findTransactionsByType(type)
        } else if (category) {
          transactions = await financeModel.findTransactionsByCategory(category)
        } else if (status) {
          transactions = await financeModel.findAllTransactions({ status: status as any })
        } else if (projectId) {
          transactions = await financeModel.findTransactionsByProject(projectId)
        } else if (clientId) {
          transactions = await financeModel.findTransactionsByClient(clientId)
        } else {
          transactions = await financeModel.findAllTransactions()
        }
    
    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المعاملات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = TransactionCreateSchema.parse(body)
    
            const { financeModel } = await import('@/lib/models')
        // Create transaction
        const transaction = await financeModel.createTransaction(validatedData)
    
    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المعاملة' },
      { status: 500 }
    )
  }
} 