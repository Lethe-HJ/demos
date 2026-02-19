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

// Demo 仓储接口
export interface IDemoRepository {
  // 查找所有demo
  findAll(): Promise<DemoDomain[]>

  // 根据分类查找
  findByCategory(category: string): Promise<DemoDomain[]>

  // 根据分类和子分类查找
  findByCategoryAndSubcategory(
    category: string,
    subcategory: string
  ): Promise<DemoDomain[]>

  // 根据ID查找
  findById(id: string): Promise<DemoDomain | null>
}
