import { MongoClient, Db } from 'mongodb'
import { DB_CONFIG } from './config'

if (!DB_CONFIG.uri) {
  // Only throw error in production or when actually trying to connect
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Please add your Mongo URI to .env.local')
  }
  // In development/build time, just return a mock
  console.warn('MongoDB URI not found, using mock connection for build')
}

const uri = DB_CONFIG.uri || 'mongodb://localhost:27017/mock'
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(DB_CONFIG.name)
}

export async function closeConnection(): Promise<void> {
  const client = await clientPromise
  await client.close()
}

// Add connectDB function for server.js compatibility
export async function connectDB(): Promise<void> {
  try {
    const client = await clientPromise
    await client.db(DB_CONFIG.name).admin().ping()
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
} 