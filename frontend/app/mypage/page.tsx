"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "./Mypage.module.css"

type Theme = {
  id: number
  title: string
  created_at: string
}

type VoteRecord = {
  theme_id: number
  theme_title: string
  winner_label: string
  loser_label: string
  created_at: string
}

export default function MyPage() {
  const { data: session } = useSession()
  const [createdThemes, setCreatedThemes] = useState<Theme[]>([])
  const [voteHistory, setVoteHistory] = useState<VoteRecord[]>([])

  const email = session?.user?.email

  useEffect(() => {
    if (!email) return

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/themes?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCreatedThemes(data)
        } else {
          setCreatedThemes([])
          console.error("createdThemes is not array:", data)
        }
      })

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/votes?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVoteHistory(data)
        } else {
          setVoteHistory([])
          console.error("voteHistory is not array:", data)
        }
      })
  }, [email])

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>マイページ</h1>

      <section className={styles.section}>
        <Link href="/theme/create" className={styles.linkHeading}>
          <h2 className={styles.sectionHeading}>お題を作成する →</h2>
        </Link>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>自分が作成したお題</h2>
        <ul className={styles.list}>
          {createdThemes.map(theme => (
            <li key={theme.id} className={styles.listItem}>
              {theme.title}（{new Date(theme.created_at).toLocaleString()}）
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>自分が遊んだお題</h2>
        <ul className={styles.list}>
          {voteHistory.map((vote, idx) => (
            <li key={idx} className={styles.listItem}>
              <strong>{vote.theme_title}</strong>：{vote.winner_label} ＞ {vote.loser_label}（{new Date(vote.created_at).toLocaleString()}）
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
