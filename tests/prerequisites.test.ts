/**
 * prerequisites.sh 主流程测试
 * 通过传入 DATABASE_URL 参数使用独立数据库，与项目默认 dev.db 隔离。
 * 断言：退出码 0、.env.local 存在且含 DATABASE_URL/AUTH_SECRET、无 [ERROR]、数据库已初始化
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn } from 'child_process'
import { mkdtempSync, cpSync, rmSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const projectRoot = join(__dirname, '..')
/** 测试专用数据库 URL，与项目默认 file:./prisma/dev.db 隔离 */
const TEST_DATABASE_URL = 'file:./prisma/test.db'
let tempDir: string

function runPrerequisitesSh(cwd: string, databaseUrl: string = TEST_DATABASE_URL): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn('bash', [join(cwd, 'prerequisites.sh'), databaseUrl], {
      cwd,
      env: { ...process.env },
      shell: true,
    })
    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (d) => { stdout += d.toString() })
    proc.stderr?.on('data', (d) => { stderr += d.toString() })
    proc.on('close', (code) => resolve({ code: code ?? -1, stdout, stderr }))
  })
}

describe('prerequisites.sh 主流程', () => {
  let result: { code: number; stdout: string; stderr: string }

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'init-test-'))
    cpSync(join(projectRoot, 'package.json'), join(tempDir, 'package.json'))
    cpSync(join(projectRoot, 'yarn.lock'), join(tempDir, 'yarn.lock'))
    cpSync(join(projectRoot, 'prisma'), join(tempDir, 'prisma'), { recursive: true })
    cpSync(join(projectRoot, 'prerequisites.sh'), join(tempDir, 'prerequisites.sh'))
    if (existsSync(join(projectRoot, 'prisma.config.ts'))) {
      cpSync(join(projectRoot, 'prisma.config.ts'), join(tempDir, 'prisma.config.ts'))
    }
    if (existsSync(join(projectRoot, 'tsconfig.json'))) {
      cpSync(join(projectRoot, 'tsconfig.json'), join(tempDir, 'tsconfig.json'))
    }
    result = await runPrerequisitesSh(tempDir)
  }, 300000)

  afterAll(() => {
    if (tempDir && existsSync(tempDir)) rmSync(tempDir, { recursive: true })
  })

  it('执行后退出码为 0', () => {
    expect(result.code).toBe(0)
  })

  it('生成 .env.local 且包含 DATABASE_URL 与 AUTH_SECRET', () => {
    const envPath = join(tempDir, '.env.local')
    expect(existsSync(envPath)).toBe(true)
    const content = readFileSync(envPath, 'utf-8')
    expect(content).toMatch(/^DATABASE_URL=/m)
    expect(content).toMatch(/^AUTH_SECRET=/m)
    const dbUrl = content.split('\n').find((l) => l.startsWith('DATABASE_URL='))?.replace(/^DATABASE_URL=/, '').trim()
    const authSecret = content.split('\n').find((l) => l.startsWith('AUTH_SECRET='))?.replace(/^AUTH_SECRET=/, '').trim()
    expect(dbUrl).toMatch(/^file:/)
    expect(authSecret?.length).toBeGreaterThanOrEqual(1)
  })

  it('stderr 中无 [ERROR]', () => {
    expect(result.stderr).not.toContain('[ERROR]')
  })

  it('数据库已初始化（存在 SQLite 文件且可读）', async () => {
    const dbPath = join(tempDir, 'prisma', 'test.db')
    expect(existsSync(dbPath)).toBe(true)
    const mod = await import('better-sqlite3') as { default?: typeof import('better-sqlite3'); Database?: typeof import('better-sqlite3') }
    const BetterSqlite3 = mod.default ?? mod.Database!
    const db = new BetterSqlite3(dbPath, { readonly: true })
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]
    db.close()
    const names = tables.map((t) => t.name)
    expect(names.some((n) => n === 'users' || n === 'demos')).toBe(true)
  })
})
