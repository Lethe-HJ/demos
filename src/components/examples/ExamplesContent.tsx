'use client'

import { type Demo } from '@/lib/examples-data'

interface ExamplesContentProps {
  currentDemo: Demo | null
}

export function ExamplesContent({ currentDemo }: ExamplesContentProps) {
  if (!currentDemo) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">请从左侧菜单选择一个案例</p>
      </div>
    )
  }

  return (
    <iframe
      src={currentDemo.iframeUrl}
      className="w-full h-full border-0"
      title={currentDemo.name}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  )
}
