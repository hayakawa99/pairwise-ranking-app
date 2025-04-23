"use client"

import { signOut } from "@/auth"

export default function LogoutButton() {
  return (
    <button onClick={() => signOut()}>
      ログアウト
    </button>
  )
}