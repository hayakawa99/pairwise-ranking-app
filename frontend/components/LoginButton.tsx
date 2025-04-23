"use client"

import { signIn } from "@/auth"

export default function LoginButton() {
  return (
    <button onClick={() => signIn("google")}>
      Googleでログイン
    </button>
  )
}
