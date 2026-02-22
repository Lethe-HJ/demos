'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Demo } from '@/lib/examples-data'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface DemoInfoDialogProps {
  demo: Demo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoInfoDialog({
  demo,
  open,
  onOpenChange
}: DemoInfoDialogProps) {
  if (!demo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{demo.name}</DialogTitle>
          <DialogDescription>{demo.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {demo.techStack && demo.techStack.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">技术栈</h4>
              <div className="flex flex-wrap gap-2">
                {demo.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted rounded-md text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
          {demo.markdownUrl && (
            <div>
              <h4 className="text-sm font-semibold mb-2">详细说明</h4>
              <Link
                href={demo.markdownUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                查看详细说明文档
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
