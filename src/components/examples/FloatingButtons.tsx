'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Info, BookOpen } from 'lucide-react'
import { DemoInfoDialog } from '@/components/demo-info/DemoInfoDialog'
import { Demo } from '@/lib/examples-data'

interface FloatingButtonsProps {
  currentDemo: Demo | null
}

export function FloatingButtons({ currentDemo }: FloatingButtonsProps) {
  const [infoOpen, setInfoOpen] = useState(false)

  if (!currentDemo) return null

  return (
    <>
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setInfoOpen(true)}
          title="查看说明信息"
        >
          <Info className="h-5 w-5" />
        </Button>
        {currentDemo.markdownUrl && (
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => {
              window.open(currentDemo.markdownUrl!, '_blank')
            }}
            title="查看详细说明"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        )}
      </div>
      <DemoInfoDialog
        demo={currentDemo}
        open={infoOpen}
        onOpenChange={setInfoOpen}
      />
    </>
  )
}
