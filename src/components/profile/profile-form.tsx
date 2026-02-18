'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

const profileSchema = z.object({
  name: z.string().max(100).optional(),
  image: z.string().url().optional().or(z.literal(''))
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  defaultValues: {
    name?: string
    image?: string
  }
  onSubmit: (data: unknown) => Promise<{ success: boolean; error?: string }>
}

export function ProfileForm({ defaultValues, onSubmit }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues
  })

  async function handleSubmit(data: ProfileFormValues) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await onSubmit(data)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || '更新失败')
      }
    } catch (err) {
      setError('更新失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>姓名</FormLabel>
              <FormControl>
                <Input placeholder="张三" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>头像 URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/avatar.jpg" {...field} />
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

        {success && (
          <div className="text-sm text-green-600 dark:text-green-400">
            更新成功！
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '更新中...' : '更新资料'}
        </Button>
      </form>
    </Form>
  )
}
