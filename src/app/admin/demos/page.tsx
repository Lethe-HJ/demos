import { listDemos } from './actions'
import { DemosTable } from '@/components/admin/demos-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default async function AdminDemosPage() {
  const result = await listDemos()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>示例管理</CardTitle>
          <CardDescription>管理案例集锦中的示例配置，支持新增、编辑、删除</CardDescription>
        </CardHeader>
        <CardContent>
          <DemosTable
            initialDemos={result.success ? result.demos : []}
            error={result.success ? undefined : result.error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
