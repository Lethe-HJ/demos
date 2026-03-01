// Demo 领域类型（与 ORM 解耦）
export interface DemoDomain {
  id: string
  category: string
  subcategory: string
  name: string
  description: string | null
  iframeUrl: string
  markdownUrl: string | null
  techStack: string | null // JSON字符串
  createdAt: Date
  updatedAt: Date
}

// 创建/更新 Demo 的 payload（不含 id、createdAt、updatedAt）
export type DemoCreateInput = Omit<
  DemoDomain,
  'id' | 'createdAt' | 'updatedAt'
>
export type DemoUpdateInput = Partial<DemoCreateInput>

// Demo 仓储接口
export interface IDemoRepository {
  findAll(): Promise<DemoDomain[]>
  findByCategory(category: string): Promise<DemoDomain[]>
  findByCategoryAndSubcategory(
    category: string,
    subcategory: string
  ): Promise<DemoDomain[]>
  findById(id: string): Promise<DemoDomain | null>
  create(data: DemoCreateInput): Promise<DemoDomain>
  update(id: string, data: DemoUpdateInput): Promise<DemoDomain>
  delete(id: string): Promise<void>
}
