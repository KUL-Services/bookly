import { NextRequest, NextResponse } from 'next/server'

// Use the same env var as the frontend to verify consistency, or fallback to localhost:5051
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5051'

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Join the path segments to form the backend path
  // e.g. /api/proxy/auth/login -> path=['auth', 'login'] -> /auth/login
  const path = params.path.join('/')
  const queryString = request.nextUrl.search

  const url = `${API_BASE}/${path}${queryString}`

  console.log(`🚀 Proxying ${request.method} ${url}`)

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    // Forward Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const body = ['POST', 'PUT', 'PATCH'].includes(request.method) ? await request.text() : undefined

    const response = await fetch(url, {
      method: request.method,
      headers,
      body
    })

    console.log(`📡 Upstream Response: ${response.status} ${response.statusText}`)

    const data = await response.text()

    // Attempt to parse JSON
    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch {
      jsonData = { message: data } // Fallback to object wrapper if text
    }

    return NextResponse.json(jsonData, { status: response.status })
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ message: 'Proxy failed', error: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest, ctx: any) {
  return proxyRequest(request, ctx)
}

export async function POST(request: NextRequest, ctx: any) {
  return proxyRequest(request, ctx)
}

export async function PUT(request: NextRequest, ctx: any) {
  return proxyRequest(request, ctx)
}

export async function PATCH(request: NextRequest, ctx: any) {
  return proxyRequest(request, ctx)
}

export async function DELETE(request: NextRequest, ctx: any) {
  return proxyRequest(request, ctx)
}
