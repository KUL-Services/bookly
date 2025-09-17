'use client'

import { useState } from 'react'
import { AuthService, BusinessService, CategoriesService } from '@/lib/api'

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      console.log('Testing login API...')
      const result = await AuthService.loginUser({
        email: 'test@example.com',
        password: 'password123'
      })
      console.log('Login result:', result)
      setResults(prev => ({ ...prev, login: result }))
    } catch (error) {
      console.error('Login error:', error)
      setResults(prev => ({ ...prev, login: { error: error.message } }))
    }
    setLoading(false)
  }

  const testCategories = async () => {
    setLoading(true)
    try {
      console.log('Testing categories API...')
      const result = await CategoriesService.getCategories()
      console.log('Categories result:', result)
      setResults(prev => ({ ...prev, categories: result }))
    } catch (error) {
      console.error('Categories error:', error)
      setResults(prev => ({ ...prev, categories: { error: error.message } }))
    }
    setLoading(false)
  }

  const testBusinesses = async () => {
    setLoading(true)
    try {
      console.log('Testing businesses API...')
      const result = await BusinessService.getApprovedBusinesses()
      console.log('Businesses result:', result)
      setResults(prev => ({ ...prev, businesses: result }))
    } catch (error) {
      console.error('Businesses error:', error)
      setResults(prev => ({ ...prev, businesses: { error: error.message } }))
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded"
        >
          Test Login API
        </button>

        <button
          onClick={testCategories}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded"
        >
          Test Categories API
        </button>

        <button
          onClick={testBusinesses}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded"
        >
          Test Businesses API
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold text-lg mb-2">{key} Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}