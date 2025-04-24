"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import styles from "./AdminCreateTopicPage.module.css"

const AdminCreateTopicPage = () => {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [title, setTitle] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [newOption, setNewOption] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const allowedPaths = ["/admin/create-topic"]
    const isAdmin = typeof window !== "undefined" && allowedPaths.includes(window.location.pathname)
    if (!isAdmin) {
      router.push("/")
    }
  }, [router])

  if (status === "loading") {
    return <p>Loading...</p>
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
      options: options.map((opt) => ({ label: opt, rating: 1500 })),
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTheme),
      })
      if (res.ok) {
        router.push("/")
      } else {
        setError("テーマの送信に失敗しました")
      }
    } catch (error) {
      setError("通信エラーが発生しました")
      console.error("Submit error:", error)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Create Topic (Admin Only)</h1>

      {error && <p className={styles.error}>{error}</p>}

      <label className={styles.label}>Title</label>
      <input
        className={styles.inputField}
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className={styles.label}>Options</label>
      {options.map((option, index) => (
        <div key={index} className={styles.optionRow}>
          <input
            className={styles.inputField}
            type="text"
            placeholder="Option"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
        </div>
      ))}

      <div className={styles.addOption}>
        <input
          className={styles.inputField}
          type="text"
          placeholder="Add option"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
        />
        <button onClick={handleAddOption}>Add option</button>
      </div>

      <button className={styles.submitButton} onClick={handleSubmit}>
        Create
      </button>

      <div className={styles.backButtonWrapper}>
        <button className={styles.backButton} onClick={() => router.push("/")}>戻る</button>
      </div>
    </div>
  )
}

export default AdminCreateTopicPage
