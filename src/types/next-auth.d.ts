import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: 'USER' | 'ADMIN'
    }
  }

  interface User {
    role?: 'USER' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'USER' | 'ADMIN'
  }
}
