import { test, expect } from '@playwright/test'

test.describe('Auth API 路由', () => {
  test('GET /api/auth/providers 返回 200 且含 providers', async ({
    request
  }) => {
    const res = await request.get('/api/auth/providers')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toBeDefined()
    expect(typeof body).toBe('object')
  })

  test('GET /api/auth/session 未登录时返回 200', async ({ request }) => {
    const res = await request.get('/api/auth/session')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toBeDefined()
  })
})
