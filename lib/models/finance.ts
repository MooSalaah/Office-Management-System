import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '../database'
import { Transaction, TransactionCreate, TransactionUpdate, Invoice, InvoiceCreate, InvoiceUpdate } from '../schemas/finance'

export class FinanceModel {
  private transactionsCollection: Promise<Collection>
  private invoicesCollection: Promise<Collection>

  constructor() {
    this.transactionsCollection = this.initCollection('transactions')
    this.invoicesCollection = this.initCollection('invoices')
  }

  private async initCollection(collectionName: string): Promise<Collection> {
    const db = await getDatabase()
    const collection = db.collection(collectionName)
    
    if (collectionName === 'transactions') {
      // Create indexes for transactions
      await collection.createIndex({ type: 1 })
      await collection.createIndex({ category: 1 })
      await collection.createIndex({ status: 1 })
      await collection.createIndex({ projectId: 1 })
      await collection.createIndex({ clientId: 1 })
      await collection.createIndex({ date: 1 })
      await collection.createIndex({ createdAt: -1 })
    } else if (collectionName === 'invoices') {
      // Create indexes for invoices
      await collection.createIndex({ invoiceNumber: 1 })
      await collection.createIndex({ clientId: 1 })
      await collection.createIndex({ projectId: 1 })
      await collection.createIndex({ status: 1 })
      await collection.createIndex({ dueDate: 1 })
      await collection.createIndex({ createdAt: -1 })
    }

    return collection
  }

  // Transaction methods
  async createTransaction(transactionData: TransactionCreate): Promise<Transaction> {
    const transactionsCollection = await this.transactionsCollection
    
    const transaction: Omit<Transaction, '_id'> = {
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await transactionsCollection.insertOne(transaction)
    return { _id: result.insertedId.toString(), ...transaction }
  }

  async findTransactionById(id: string): Promise<Transaction | null> {
    const transactionsCollection = await this.transactionsCollection
    const transaction = await transactionsCollection.findOne({ _id: new ObjectId(id) })
    return transaction ? { ...transaction, _id: transaction._id.toString() } as Transaction : null
  }

  async findAllTransactions(filter: Partial<Transaction> = {}): Promise<Transaction[]> {
    const transactionsCollection = await this.transactionsCollection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const transactions = await transactionsCollection.find(mongoFilter).sort({ date: -1 }).toArray()
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
    const transactionsCollection = await this.transactionsCollection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await transactionsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Transaction : null
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const transactionsCollection = await this.transactionsCollection
    const result = await transactionsCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getTransactionStats() {
    const transactionsCollection = await this.transactionsCollection
    const pipeline = [
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]
    
    const stats = await transactionsCollection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount }
      return acc
    }, {} as Record<string, { count: number; totalAmount: number }>)
  }

  async getTotalIncome(): Promise<number> {
    const transactionsCollection = await this.transactionsCollection
    const result = await transactionsCollection.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }

  async getTotalExpenses(): Promise<number> {
    const transactionsCollection = await this.transactionsCollection
    const result = await transactionsCollection.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const transactionsCollection = await this.transactionsCollection
    const transactions = await transactionsCollection.find()
      .sort({ date: -1 })
      .limit(limit)
      .toArray()
    
    return transactions.map(transaction => ({ ...transaction, _id: transaction._id.toString() } as Transaction))
  }

  // Invoice methods
  async createInvoice(invoiceData: InvoiceCreate): Promise<Invoice> {
    const invoicesCollection = await this.invoicesCollection
    
    const invoice: Omit<Invoice, '_id'> = {
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await invoicesCollection.insertOne(invoice)
    return { _id: result.insertedId.toString(), ...invoice }
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    const invoicesCollection = await this.invoicesCollection
    const invoice = await invoicesCollection.findOne({ _id: new ObjectId(id) })
    return invoice ? { ...invoice, _id: invoice._id.toString() } as Invoice : null
  }

  async findInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const invoicesCollection = await this.invoicesCollection
    const invoice = await invoicesCollection.findOne({ invoiceNumber })
    return invoice ? { ...invoice, _id: invoice._id.toString() } as Invoice : null
  }

  async findAllInvoices(filter: Partial<Invoice> = {}): Promise<Invoice[]> {
    const invoicesCollection = await this.invoicesCollection
    const mongoFilter = { ...filter } as any
    if (mongoFilter._id) {
      mongoFilter._id = new ObjectId(mongoFilter._id)
    }
    const invoices = await invoicesCollection.find(mongoFilter).sort({ createdAt: -1 }).toArray()
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
    const invoicesCollection = await this.invoicesCollection
    const update = { ...updateData, updatedAt: new Date() }

    const result = await invoicesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    return result ? { ...result, _id: result._id.toString() } as Invoice : null
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const invoicesCollection = await this.invoicesCollection
    const result = await invoicesCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async getInvoiceStats() {
    const invoicesCollection = await this.invoicesCollection
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]
    
    const stats = await invoicesCollection.aggregate(pipeline).toArray()
    return stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount }
      return acc
    }, {} as Record<string, { count: number; totalAmount: number }>)
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const invoicesCollection = await this.invoicesCollection
    const today = new Date()
    const invoices = await invoicesCollection.find({
      dueDate: { $lt: today },
      status: { $in: ['pending', 'sent'] }
    }).toArray()
    
    return invoices.map(invoice => ({ ...invoice, _id: invoice._id.toString() } as Invoice))
  }

  async getTotalInvoicedAmount(): Promise<number> {
    const invoicesCollection = await this.invoicesCollection
    const result = await invoicesCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }

  async getTotalPaidAmount(): Promise<number> {
    const invoicesCollection = await this.invoicesCollection
    const result = await invoicesCollection.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray()
    
    return result.length > 0 ? result[0].total : 0
  }
}

export const financeModel = new FinanceModel() 