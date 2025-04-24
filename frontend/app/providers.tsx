"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { ReactNode, useEffect, useState } from "react"

function SyncUserToBackend() {
  const { data: session, status } = useSession()
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user && !synced) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }),
      }).then(() => {
        setSynced(true)
      }).catch((err) => {
        console.error("ユーザー登録エラー:", err)
      })
    }
  }, [session, status, synced])

  return null
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <SyncUserToBackend />
      {children}
    </SessionProvider>
  )
}
