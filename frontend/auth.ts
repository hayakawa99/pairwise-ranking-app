// frontend/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const {
  handlers: { GET, POST }, // ルート用に GET / POST を個別にエクスポート
  auth,
  signIn,
  signOut
} = NextAuth({
  providers: [Google],
  trustHost: true,
  session: { strategy: "jwt" }
})