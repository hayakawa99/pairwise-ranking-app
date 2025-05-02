"use client";

import { useState, useEffect, useMemo } from "react";
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

  useEffect(() => {
    if (!email) return;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    fetch(`${base}/api/user/themes?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((d) => setCreatedThemes(Array.isArray(d) ? d : []));

    fetch(`${base}/api/user/votes?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((d) => setVoteHistory(Array.isArray(d) ? d : []));
  }, [email]);

  // 投票履歴に基づいてユニークな「遊んだお題」を抽出（作成者かどうかは問わない）
  const playedThemes = useMemo(() => {
    return Array.from(
      voteHistory.reduce<Map<number, { id: number; title: string }>>(
        (m, v) => m.set(v.theme_id, { id: v.theme_id, title: v.theme_title }),
        new Map()
      ).values()
    );
  }, [voteHistory]);

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

  return (
    <main className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heroTitle}>HIKAKING</h1>
        <Link href="/theme/create" className={styles.linkWrapper}>
          <button className={styles.createButton}>お題を作成する</button>
        </Link>
      </div>

      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionHeading}>作成したお題</h2>
        {createdThemes.length === 0 ? (
          <p className={styles.emptyText}>作成したお題はありません。</p>
        ) : (
          <div className={styles.themeList}>
            {createdThemes.map((t) => (
              <div key={t.id} className={styles.themeCard}>
                <div className={styles.themeInfo}>
                  <h3 className={styles.themeTitle}>{t.title}</h3>
                  <p className={styles.themeDate}>
                    {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(t.id)}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionHeading}>遊んだお題</h2>
        {playedThemes.length === 0 ? (
          <p className={styles.emptyText}>遊んだお題はありません。</p>
        ) : (
          <div className={styles.themeList}>
            {playedThemes.map((t) => (
              <Link
                key={t.id}
                href={`/ranking?themeId=${t.id}&mine=1`}
                className={styles.themeCardLink}
              >
                <div className={styles.themeCard}>
                  <h3 className={styles.themeTitle}>{t.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={styles.backButtonWrapper}>
        <Link href="/" className={styles.linkWrapper}>
          <button className={styles.backButton}>トップページに戻る</button>
        </Link>
      </div>
    </main>
  );
}
