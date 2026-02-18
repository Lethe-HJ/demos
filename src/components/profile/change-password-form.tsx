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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z
    .string()
    .min(8, '新密码至少8位')
    .regex(/[A-Z]/, '密码需包含大写字母')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/[0-9]/, '密码需包含数字'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword']
})

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

interface ChangePasswordFormProps {
  onSubmit: (data: unknown) => Promise<{ success: boolean; error?: string }>
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  async function handleSubmit(data: ChangePasswordFormValues) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await onSubmit({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      if (result.success) {
        setSuccess(true)
        form.reset()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || '修改失败')
      }
    } catch (err) {
      setError('修改失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>当前密码</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>新密码</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认新密码</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
            密码修改成功！
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '修改中...' : '修改密码'}
        </Button>
      </form>
    </Form>
  )
}
