"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Theme, Option } from '@types';
import styles from './RankingPage.module.css';

export default function RankingPage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const themeId = searchParams.get("themeId");

  useEffect(() => {
    if (!themeId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes/${themeId}`)
      .then(res => res.json())
      .then(setTheme)
      .catch(err => console.error('ランキング取得失敗', err));
  }, [themeId]);

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
              .map((option: Option, index: number) => (
                <div key={option.id} className={styles.optionCard}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.rating}>({option.rating.toFixed(2)})</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
