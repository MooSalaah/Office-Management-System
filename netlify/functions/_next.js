const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

exports.handler = async (event, context) => {
  try {
    await app.prepare()
    
    const { httpMethod, path, queryStringParameters, body, headers } = event
    
    // Create a mock request object
    const req = {
      method: httpMethod,
      url: path,
      query: queryStringParameters || {},
      body: body,
      headers: headers || {}
    }
    
    // Create a mock response object
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: (name, value) => {
        res.headers[name] = value
      },
      end: (data) => {
        res.body = data
      }
    }
    
    // Handle the request
    await handle(req, res)
    
    return {
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
} 