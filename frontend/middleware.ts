import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url))  // 未ログインならトップページへ
  }

  return NextResponse.next()
}

// 認証チェック対象のルート指定
export const config = {
  matcher: [
    "/theme/:id*",       // [id] ページ全体
    "/theme/new",        // 新規作成ページなど追加したいパスがあればここに列挙
  ],
}
