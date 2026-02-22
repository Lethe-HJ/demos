'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { EditUserDialog } from './edit-user-dialog'
import { CreateUserDialog } from './create-user-dialog'
import { deleteUser } from '@/app/admin/users/actions'
import type { User, ListUsersResult } from '@/lib/repositories/types'

interface UsersTableProps {
  initialData: ListUsersResult
  currentPage: number
  currentPageSize: number
  currentSearch?: string
  currentRole?: 'USER' | 'ADMIN'
}

export function UsersTable({
  initialData,
  currentPage,
  currentPageSize,
  currentSearch,
  currentRole
}: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')
  const [roleFilter, setRoleFilter] = useState<'USER' | 'ADMIN' | ''>(
    currentRole || ''
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function updateSearchParams(params: Record<string, string | undefined>) {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    router.push(`/admin/users?${newParams.toString()}`)
  }

  function handleSearch() {
    updateSearchParams({
      search: search || undefined,
      role: roleFilter || undefined,
      page: '1'
    })
  }

  function handlePageChange(newPage: number) {
    updateSearchParams({
      page: newPage.toString(),
      search: currentSearch,
      role: currentRole
    })
  }

  async function handleDelete(userId: string) {
    if (!confirm('确定要删除这个用户吗？')) {
      return
    }

    setDeletingId(userId)
    try {
      const result = await deleteUser(userId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '删除失败')
      }
    } catch (err) {
      alert('删除失败，请稍后重试')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索邮箱或姓名..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="max-w-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as 'USER' | 'ADMIN' | '')
          }
          className="px-3 py-2 border rounded-md"
        >
          <option value="">全部角色</option>
          <option value="USER">普通用户</option>
          <option value="ADMIN">管理员</option>
        </select>
        <Button onClick={handleSearch}>搜索</Button>
        <CreateUserDialog />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>邮箱</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  暂无用户
                </TableCell>
              </TableRow>
            ) : (
              initialData.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>
                    {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditUserDialog user={user} />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? '删除中...' : '删除'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {initialData.total} 条，第 {currentPage} /{' '}
            {initialData.totalPages} 页
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= initialData.totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
