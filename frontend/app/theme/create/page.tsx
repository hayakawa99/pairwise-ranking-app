"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import styles from "./CreateThemePage.module.css"

export default function CreateThemePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [newOption, setNewOption] = useState("")
  const [error, setError] = useState<string | null>(null)
  const defaultMu = process.env.NEXT_PUBLIC_DEFAULT_MU
    ? Number(process.env.NEXT_PUBLIC_DEFAULT_MU)
    : 25

  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user?.email) {
        router.push("/")
      } else {
        // ユーザー登録リクエスト（メールアドレスのみ）
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email })
        }).catch((err) => {
          console.error("ユーザー登録エラー", err)
        })
      }
    }
  }, [status, session, router])

  if (status === "loading") {
    return <p>読み込み中...</p>
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleAddOption = () => {
    const trimmed = newOption.trim()
    if (!trimmed) return
    if (options.includes(trimmed)) {
      alert("同じ名前の選択肢は追加できません")
      setNewOption("")
      return
    }
    setOptions([...options, trimmed])
    setNewOption("")
  }

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      setError("ログインユーザーのemailが取得できませんでした")
      return
    }
    const newTheme = {
      title,
      user_email: session.user.email,
      options: options.map(opt => ({ label: opt, rating: defaultMu }))
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTheme)
        }
      )
      if (!res.ok) {
        const text = await res.text()
        setError(`お題の作成に失敗しました: ${text}`)
        return
      }
      router.push("/mypage")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(`通信エラーが発生しました: ${msg}`)
      console.error("Submit error:", e)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>お題を作成する</h1>

      {error && <p className={styles.error}>{error}</p>}

      <label className={styles.label}>タイトル</label>
      <input
        className={styles.inputField}
        type="text"
        placeholder="お題のタイトルを入力"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <label className={styles.label}>選択肢</label>
      {options.map((opt, idx) => (
        <div key={idx} className={styles.optionRow}>
          <input
            className={styles.inputField}
            type="text"
            placeholder={`選択肢${idx + 1}`}
            value={opt}
            onChange={e => handleOptionChange(idx, e.target.value)}
          />
        </div>
      ))}

      <div className={styles.addOption}>
        <input
          className={styles.inputField}
          type="text"
          placeholder="選択肢を追加"
          value={newOption}
          onChange={e => setNewOption(e.target.value)}
        />
        <button className="btn-primary" onClick={handleAddOption}>
          追加
        </button>
      </div>

      <button className={styles.submitButton} onClick={handleSubmit}>
        作成
      </button>

      <div className={styles.backButtonWrapper}>
        <button className={styles.backButton} onClick={() => router.push("/mypage")}>
          マイページに戻る
        </button>
      </div>
    </div>
  )
}
