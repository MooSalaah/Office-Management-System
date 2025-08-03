// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Check if we're in production and API URL is set
export const isProduction = process.env.NODE_ENV === 'production'
export const hasApiUrl = !!API_BASE_URL

// Get the full API URL for a given endpoint
export function getApiUrl(endpoint: string): string {
  // In production, always use the external API URL (Render)
  if (isProduction) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://office-management-system-v82i.onrender.com'
    return `${apiUrl}${endpoint}`
  }
  
  // In development, use relative URL
  return endpoint
}

// Database configuration
export const DB_CONFIG = {
  uri: process.env.MONGODB_URI,
  name: process.env.MONGODB_DB || 'office_management'
}

// JWT configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d'
}

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
} 