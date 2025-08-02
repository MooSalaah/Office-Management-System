import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Transaction, TransactionCreate, TransactionUpdate, Invoice, InvoiceCreate, InvoiceUpdate } from '../schemas/finance'

export class FinanceModel {
  private transactionsCollection!: Collection
  private invoicesCollection!: Collection

  constructor() {
    // Don't initialize collection in constructor
  }

  private async initCollection() {
    if (this.transactionsCollection) return
    
    const db = await getDatabase()
    this.transactionsCollection = db.collection('transactions')
    this.invoicesCollection = db.collection('invoices')
    
    // Create indexes for transactions
    await this.transactionsCollection.createIndex({ type: 1 })
    await this.transactionsCollection.createIndex({ category: 1 })
    await this.transactionsCollection.createIndex({ status: 1 })
    await this.transactionsCollection.createIndex({ projectId: 1 })
    await this.transactionsCollection.createIndex({ clientId: 1 })
    await this.transactionsCollection.createIndex({ date: 1 })
    await this.transactionsCollection.createIndex({ createdAt: -1 })
    
    // Create indexes for invoices
    await this.invoicesCollection.createIndex({ invoiceNumber: 1 })
    await this.invoicesCollection.createIndex({ clientId: 1 })
    await this.invoicesCollection.createIndex({ projectId: 1 })
    await this.invoicesCollection.createIndex({ status: 1 })
    await this.invoicesCollection.createIndex({ dueDate: 1 })
    await this.invoicesCollection.createIndex({ createdAt: -1 })
  }

  // Transaction methods
  async createTransaction(transactionData: TransactionCreate): Promise<Transaction> {
    await this.initCollection()
    
    const transaction: Omit<Transaction, '_id'> = {
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.transactionsCollection.insertOne(transaction)
    return { _id: result.insertedId.toString(), ...transaction }
  }

  async findTransactionById(id: string): Promise<Transaction | null> {
    await this.initCollection()
    const transaction = await this.transactionsCollection.findOne({ _id: new ObjectId(id) })
    return transaction ? { ...transaction, _id: transaction._id.toString() } as Transaction : null
  }

  async findAllTransactions(filter: Partial<Transaction> = {}): Promise<Transaction[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const transactions = await this.transactionsCollection.find(mongoFilter).sort({ date: -1 }).toArray()
    return transactions.map(transaction => ({ ...transaction, _id: transaction._id.toString() } as Transaction))
  }

  async findTransactionsByType(type: string): Promise<Transaction[]> {
    return this.findAllTransactions({ type: type as any })
  }

  async findTransactionsByCategory(category: string): Promise<Transaction[]> {
    return this.findAllTransactions({ category: category as any })
  }

  async findTransactionsByProject(projectId: string): Promise<Transaction[]> {
    return this.findAllTransactions({ projectId })
  }

  async findTransactionsByClient(clientId: string): Promise<Transaction[]> {
    return this.findAllTransactions({ clientId })
  }

  async updateTransaction(id: string, updateData: TransactionUpdate): Promise<Transaction | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.transactionsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Transaction : null
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.transactionsCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getTransactionStats() {
    await this.initCollection()
    const pipeline = [
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]
    
    const stats = await this.transactionsCollection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount }
      return acc
    }, {} as Record<string, { count: number; totalAmount: number }>)
  }

  async getTotalIncome(): Promise<number> {
    await this.initCollection()
    const result = await this.transactionsCollection.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }

  async getTotalExpenses(): Promise<number> {
    await this.initCollection()
    const result = await this.transactionsCollection.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    await this.initCollection()
    const transactions = await this.transactionsCollection.find()
      .sort({ date: -1 })
      .limit(limit)
      .toArray()
    
    return transactions.map(transaction => ({ ...transaction, _id: transaction._id.toString() } as Transaction))
  }

  // Invoice methods
  async createInvoice(invoiceData: InvoiceCreate): Promise<Invoice> {
    await this.initCollection()
    
    const invoice: Omit<Invoice, '_id'> = {
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await this.invoicesCollection.insertOne(invoice)
    return { _id: result.insertedId.toString(), ...invoice }
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    await this.initCollection()
    const invoice = await this.invoicesCollection.findOne({ _id: new ObjectId(id) })
    return invoice ? { ...invoice, _id: invoice._id.toString() } as Invoice : null
  }

  async findInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    await this.initCollection()
    const invoice = await this.invoicesCollection.findOne({ invoiceNumber })
    return invoice ? { ...invoice, _id: invoice._id.toString() } as Invoice : null
  }

  async findAllInvoices(filter: Partial<Invoice> = {}): Promise<Invoice[]> {
    await this.initCollection()
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const invoices = await this.invoicesCollection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
    return invoices.map(invoice => ({ ...invoice, _id: invoice._id.toString() } as Invoice))
  }

  async findInvoicesByClient(clientId: string): Promise<Invoice[]> {
    return this.findAllInvoices({ clientId })
  }

  async findInvoicesByProject(projectId: string): Promise<Invoice[]> {
    return this.findAllInvoices({ projectId })
  }

  async findInvoicesByStatus(status: string): Promise<Invoice[]> {
    return this.findAllInvoices({ status: status as any })
  }

  async updateInvoice(id: string, updateData: InvoiceUpdate): Promise<Invoice | null> {
    await this.initCollection()
    const update = { ...updateData, updatedAt: new Date() }

    const result = await this.invoicesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Invoice : null
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await this.initCollection()
    const result = await this.invoicesCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getInvoiceStats() {
    await this.initCollection()
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]
    
    const stats = await this.invoicesCollection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount }
      return acc
    }, {} as Record<string, { count: number; totalAmount: number }>)
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    await this.initCollection()
    const today = new Date()
    const invoices = await this.invoicesCollection.find({
      dueDate: { $lt: today },
      status: { $in: ['pending', 'sent'] }
    }).toArray()
    
    return invoices.map(invoice => ({ ...invoice, _id: invoice._id.toString() } as Invoice))
  }

  async getTotalInvoicedAmount(): Promise<number> {
    await this.initCollection()
    const result = await this.invoicesCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }

  async getTotalPaidAmount(): Promise<number> {
    await this.initCollection()
    const result = await this.invoicesCollection.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }
}

export const financeModel = new FinanceModel() 