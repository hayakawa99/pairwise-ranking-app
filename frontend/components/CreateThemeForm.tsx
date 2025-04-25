"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function CreateThemeForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [optA, setOptA] = useState("")
  const [optB, setOptB] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      setError("ログイン情報が取得できません")
      return
    }
    const defaultMu = process.env.NEXT_PUBLIC_DEFAULT_MU
      ? Number(process.env.NEXT_PUBLIC_DEFAULT_MU)
      : 25
    const payload = {
      title,
      user_email: session.user.email,
      options: [
        { label: optA, rating: defaultMu },
        { label: optB, rating: defaultMu }
      ]
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      )
      if (!res.ok) {
        const text = await res.text()
        setError(`お題作成に失敗しました: ${text}`)
        return
      }
      const { id } = await res.json()
      router.push(`/theme/${id}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(`通信エラー: ${msg}`)
    }
  }

  return (
    <div>
      <input
        placeholder="タイトル"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        placeholder="選択肢A"
        value={optA}
        onChange={e => setOptA(e.target.value)}
      />
      <input
        placeholder="選択肢B"
        value={optB}
        onChange={e => setOptB(e.target.value)}
      />
      <button onClick={handleSubmit}>送信</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}
