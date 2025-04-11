"use client";
import { useEffect, useState } from 'react';
import { Theme, Option } from '@types';
import styles from './RankingPage.module.css'; // CSSモジュールを使う場合

export default function RankingPage() {
  const [data, setData] = useState<Theme[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('ランキング取得失敗', err));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>ランキング一覧</h1>
      <div className={styles.rankings}>
        {data.map((theme: Theme) => (
          <div key={theme.id} className={styles.themeCard}>
            <h2 className={styles.themeTitle}>{theme.title}</h2>
            <div className={styles.optionsList}>
              {theme.options
                ?.sort((a: Option, b: Option) => b.rating - a.rating)
                .map((option: Option, index: number) => (
                  <div key={option.label} className={styles.optionCard}>
                    <span className={styles.rank}>#{index + 1}</span>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.rating}>({option.rating.toFixed(2)})</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
