"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./Mypage.module.css";

type Theme = {
  id: number;
  title: string;
  created_at: string;
  user_email: string;
};

type VoteRecord = {
  theme_id: number;
  theme_title: string;
  winner_label: string;
  loser_label: string;
  created_at: string;
};

export default function MyPage() {
  const { data: session } = useSession();
  const [createdThemes, setCreatedThemes] = useState<Theme[]>([]);
  const [voteHistory, setVoteHistory] = useState<VoteRecord[]>([]);
  const email = session?.user?.email;

  /* -------------------- データ取得 -------------------- */
  useEffect(() => {
    if (!email) return;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;

    fetch(`${base}/api/user/themes?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((d) => setCreatedThemes(Array.isArray(d) ? d : []));

    fetch(`${base}/api/user/votes?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((d) => setVoteHistory(Array.isArray(d) ? d : []));
  }, [email]);

  /* -------------------- 作成お題削除 -------------------- */
  const handleDelete = async (id: number) => {
    if (!confirm("このお題を削除してよろしいですか？")) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email }),
      }
    );
    if (res.ok) {
      setCreatedThemes((prev) => prev.filter((t) => t.id !== id));
    } else {
      console.error("削除失敗", await res.text());
    }
  };

  /* -------------------- 遊んだお題をグループ化 -------------------- */
  const playedThemes = Array.from(
    voteHistory.reduce<Map<number, { id: number; title: string }>>(
      (m, v) => m.set(v.theme_id, { id: v.theme_id, title: v.theme_title }),
      new Map()
    ).values()
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>マイページ</h1>

      {/* お題作成リンク */}
      <section className={styles.section}>
        <Link href="/theme/create" className={styles.linkHeading}>
          <h2 className={styles.sectionHeading}>お題を作成する →</h2>
        </Link>
      </section>

      {/* 自分が作成したお題 */}
      <section className={styles.section}>
        <details>
          <summary className={styles.summary}>
            自分が作成したお題 ({createdThemes.length})
          </summary>
          <ul className={styles.list}>
            {createdThemes.map((t) => (
              <li key={t.id} className={styles.listItem}>
                <span>
                  {t.title}（
                  {new Date(t.created_at).toLocaleString()}
                  ）
                </span>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(t.id)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {/* 自分が遊んだお題（アコーディオン） */}
      <section className={styles.section}>
        <details>
          <summary className={styles.summary}>
            自分が遊んだお題 ({playedThemes.length})
          </summary>
          <ul className={styles.list}>
            {playedThemes.map((t) => (
              <li key={t.id} className={styles.listItem}>
                <Link
                  href={`/ranking?themeId=${t.id}&mine=1`}
                  className={styles.playedLink}
                >
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <div className={styles.backButtonWrapper}>
        <Link href="/">
          <button className={styles.backButton}>トップページに戻る</button>
        </Link>
      </div>
    </div>
  );
}
