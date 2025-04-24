"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import styles from "./page.module.css"

type Theme = {
  id: number
  title: string
}

export default function MainPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [themes, setThemes] = useState<Theme[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`)
        if (!res.ok) throw new Error("Failed to fetch themes")
        const data = await res.json()

        if (Array.isArray(data)) {
          setThemes(data)
        } else {
          setThemes([])
          console.error("Expected array but got:", data)
        }
      } catch (error) {
        setError("Error fetching themes")
        console.error("Fetch error:", error)
      }
    }

    fetchThemes()
  }, [])

  if (status === "loading") {
    return <p>Loading...</p>
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heroTitle}>HIKAKING</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          {session && (
            <Link href="/mypage">
              <button className={styles.authButton}>マイページ</button>
            </Link>
          )}
          {session ? (
            <button className={styles.authButton} onClick={() => signOut()}>ログアウト</button>
          ) : (
            <button className={styles.authButton} onClick={() => signIn("google")}>ログイン</button>
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <h2 className={styles.subHeading}>お題一覧</h2>
      <div className={styles.themeList}>
        {themes.length > 0 ? (
          themes.map((theme) => (
            <div
              key={theme.id}
              className={styles.themeCard}
              onClick={() => router.push(`/theme/${theme.id}`)}
            >
              <h3 className={styles.themeTitle}>{theme.title}</h3>
            </div>
          ))
        ) : (
          <p>お題がまだ登録されていません。</p>
        )}
      </div>
    </main>
  )
}
