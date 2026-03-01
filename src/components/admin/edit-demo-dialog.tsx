'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { updateDemo } from '@/app/admin/demos/actions'
import type { DemoDomain } from '@/lib/repositories/demo-repository'

const editDemoSchema = z.object({
  category: z.string().min(1, '请输入一级分类'),
  subcategory: z.string().min(1, '请输入二级分类'),
  name: z.string().min(1, '请输入名称'),
  description: z.string().optional(),
  iframeUrl: z.string().min(1, '请输入 iframe 链接'),
  markdownUrl: z.string().optional(),
  techStack: z.string().optional()
})

type EditDemoFormValues = z.infer<typeof editDemoSchema>

interface EditDemoDialogProps {
  demo: DemoDomain
}

export function EditDemoDialog({ demo }: EditDemoDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditDemoFormValues>({
    resolver: zodResolver(editDemoSchema),
    defaultValues: {
      category: demo.category,
      subcategory: demo.subcategory,
      name: demo.name,
      description: demo.description ?? '',
      iframeUrl: demo.iframeUrl,
      markdownUrl: demo.markdownUrl ?? '',
      techStack: demo.techStack ?? ''
    }
  })

  async function onSubmit(data: EditDemoFormValues) {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await updateDemo(demo.id, data)
      if (result.success) {
        setOpen(false)
        router.refresh()
      } else {
        setError(result.error || '更新失败')
      }
    } catch {
      setError('更新失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑示例</DialogTitle>
          <DialogDescription>修改示例配置</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>一级分类</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>二级分类</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述（可选）</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iframeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>iframe 链接</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="markdownUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>说明文档链接（可选）</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>技术栈 JSON（可选）</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '更新中...' : '更新'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
