"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Theme, Option } from '@types';
import styles from './RankingPage.module.css';

export default function RankingPage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [voteCounts, setVoteCounts] = useState<Map<number, number>>(new Map());
  const searchParams = useSearchParams();
  const router = useRouter();
  const themeId = searchParams.get("themeId");

  useEffect(() => {
    if (!themeId) return;

    const voted = sessionStorage.getItem(`voted-theme-${themeId}`);
    const votedOptionsRaw = sessionStorage.getItem(`voted-options-${themeId}`);

    if (!voted) {
      router.replace(`/theme/${themeId}`);
      return;
    }

    // ✅ 複数回の投票履歴読み込み
    if (votedOptionsRaw) {
      try {
        const parsed: number[] = JSON.parse(votedOptionsRaw);
        const counts = new Map<number, number>();
        parsed.forEach(id => {
          counts.set(id, (counts.get(id) || 0) + 1);
        });
        setVoteCounts(counts);
      } catch (err) {
        console.warn("投票履歴の解析に失敗しました", err);
      }
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes/${themeId}`)
      .then(res => res.json())
      .then(setTheme)
      .catch(err => console.error('ランキング取得失敗', err));
  }, [themeId, router]);

  if (!theme) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{theme.title} のランキング</h1>

      <div className={styles.backButtonWrapper}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          トップページに戻る
        </button>
      </div>

      <div className={styles.rankings}>
        <div className={styles.themeCard}>
          <div className={styles.optionsList}>
            {theme.options
              ?.sort((a: Option, b: Option) => b.rating - a.rating)
              .map((option: Option, index: number) => {
                const rankClass =
                  index === 0 ? styles["rank-1"] :
                  index === 1 ? styles["rank-2"] :
                  index === 2 ? styles["rank-3"] : "";

                const rankIcon =
                  index === 0 ? "🥇" :
                  index === 1 ? "🥈" :
                  index === 2 ? "🥉" : null;

                const count = voteCounts.get(option.id) || 0;
                const votedClass =
                  count >= 5 ? styles.votedStrong :
                  count >= 2 ? styles.votedMid : "";

                return (
                  <div key={option.id} className={`${styles.optionCard} ${rankClass} ${votedClass}`}>
                    {rankIcon && <div className={styles.rankIcon}>{rankIcon}</div>}
                    <div className={styles.optionLabel}>{option.label}</div>
                    {index >= 3 && (
                      <div className={styles.optionMeta}>
                        <span className={styles.rankText}>#{index + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
