import { test, expect } from '@playwright/test'

// 使用 seed 创建的管理员账户（prisma/seed.ts）
const seedAdmin = { email: 'admin@example.com', password: 'Admin123456' }

test.describe('注册流程', () => {
  test('打开注册页并提交表单', async ({ page }) => {
    const email = `e2e-${Date.now()}@test.local`
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /注册/ })).toBeVisible()
    await page.getByLabel('邮箱').fill(email)
    await page.getByLabel(/姓名/).fill('E2E User')
    await page.getByLabel('密码').first().fill('TestPass123')
    await page.getByLabel('确认密码').fill('TestPass123')
    await page.getByRole('button', { name: '注册' }).click()
    await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10000 })
  })
})

test.describe('登录流程', () => {
  test('使用邮箱密码登录', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /登录/ })).toBeVisible()
    await page.getByLabel('邮箱').fill(seedAdmin.email)
    await page.getByLabel('密码').fill(seedAdmin.password)
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page).toHaveURL(/\/(profile|$)/, { timeout: 10000 })
  })
})

test.describe('个人资料', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('邮箱').fill(seedAdmin.email)
    await page.getByLabel('密码').fill(seedAdmin.password)
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page).toHaveURL(/\/(profile|$)/, { timeout: 10000 })
  })

  test('访问个人资料页', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible({ timeout: 5000 })
  })
})

test.describe('管理端用户列表', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('邮箱').fill(seedAdmin.email)
    await page.getByLabel('密码').fill(seedAdmin.password)
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page).toHaveURL(/\/(profile|$)/, { timeout: 10000 })
  })

  test('管理员可访问用户管理页', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.getByRole('heading', { name: /用户|管理/ })).toBeVisible({ timeout: 5000 })
  })
})
