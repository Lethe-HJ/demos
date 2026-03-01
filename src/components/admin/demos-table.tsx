'use client'

import { useRouter } from 'next/navigation'
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
import { CreateDemoDialog } from './create-demo-dialog'
import { EditDemoDialog } from './edit-demo-dialog'
import { deleteDemo } from '@/app/admin/demos/actions'
import type { DemoDomain } from '@/lib/repositories/demo-repository'
import { useState } from 'react'

interface DemosTableProps {
  initialDemos: DemoDomain[]
  error?: string
}

export function DemosTable({ initialDemos, error }: DemosTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  const filteredDemos =
    categoryFilter.trim() === ''
      ? initialDemos
      : initialDemos.filter(
          (d) =>
            d.category.toLowerCase().includes(categoryFilter.toLowerCase()) ||
            d.subcategory.toLowerCase().includes(categoryFilter.toLowerCase()) ||
            d.name.toLowerCase().includes(categoryFilter.toLowerCase())
        )

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个示例吗？')) return
    setDeletingId(id)
    try {
      const result = await deleteDemo(id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '删除失败')
      }
    } catch {
      alert('删除失败，请稍后重试')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="按分类或名称筛选..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="max-w-sm"
        />
        <CreateDemoDialog />
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>一级分类</TableHead>
              <TableHead>二级分类</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>iframe 链接</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDemos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {initialDemos.length === 0 ? '暂无示例，点击「新增示例」添加' : '无匹配结果'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDemos.map((demo) => (
                <TableRow key={demo.id}>
                  <TableCell>{demo.category}</TableCell>
                  <TableCell>{demo.subcategory}</TableCell>
                  <TableCell>{demo.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {demo.description || '-'}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {demo.iframeUrl}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditDemoDialog demo={demo} />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(demo.id)}
                        disabled={deletingId === demo.id}
                      >
                        {deletingId === demo.id ? '删除中...' : '删除'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
