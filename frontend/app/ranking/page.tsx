"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Theme, Option } from "@types";
import styles from "./RankingPage.module.css";

export default function RankingPage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [voteCounts, setVoteCounts] = useState<Map<number, number>>(new Map());
  const [loserCounts, setLoserCounts] = useState<Map<number, number>>(
    new Map()
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const themeId = searchParams.get("themeId");

  useEffect(() => {
    if (!themeId || typeof themeId !== "string") return;

    const voted = sessionStorage.getItem(`voted-theme-${themeId}`);
    const votedOptionsRaw = sessionStorage.getItem(`voted-options-${themeId}`);
    const votedLosersRaw = sessionStorage.getItem(`voted-losers-${themeId}`);

    if (!voted) {
      router.replace(`/theme/${themeId}`);
      return;
    }

    if (votedOptionsRaw) {
      try {
        const parsed: number[] = JSON.parse(votedOptionsRaw);
        const counts = new Map<number, number>();
        parsed.forEach((id) => {
          counts.set(id, (counts.get(id) || 0) + 1);
        });
        setVoteCounts(counts);
      } catch (err) {
        console.warn("投票履歴の解析に失敗しました", err);
      }
    }

    if (votedLosersRaw) {
      try {
        const parsed: number[] = JSON.parse(votedLosersRaw);
        const counts = new Map<number, number>();
        parsed.forEach((id) => {
          counts.set(id, (counts.get(id) || 0) + 1);
        });
        setLoserCounts(counts);
      } catch (err) {
        console.warn("敗者履歴の解析に失敗しました", err);
      }
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes/${themeId}/ranking`
    )
      .then((res) => res.json())
      .then(setTheme)
      .catch((err) => console.error("ランキング取得失敗", err));
  }, [themeId, router]);

  if (!theme) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        {theme.title}
        <br />
        ランキング
      </h1>

      <div className={styles.backButtonWrapper}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          トップページに戻る
        </button>
      </div>

      <div className={styles.rankings}>
        <div className={styles.themeCard}>
          <div className={styles.optionsList}>
            {theme.options.map((option: Option, index: number) => {
              const rankClass =
                index === 0
                  ? styles["rank-1"]
                  : index === 1
                  ? styles["rank-2"]
                  : index === 2
                  ? styles["rank-3"]
                  : "";

              const rankIcon =
                index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : `${index + 1}`;

              const count = voteCounts.get(option.id) || 0;
              const lossCount = loserCounts.get(option.id) || 0;

              let votedClass = "";
              if (count >= 5) votedClass = styles.votedStrong;
              else if (count >= 2) votedClass = styles.votedMid;
              else if (count === 1) votedClass = styles.voted1;

              const loweredClass = lossCount >= 2 ? styles.lowered : "";

              return (
                <div
                  key={option.id}
                  className={`${styles.optionCard} ${rankClass} ${votedClass} ${loweredClass}`}
                >
                  <div className={styles.rankIcon}>{rankIcon}</div>
                  <div className={styles.optionLabel}>{option.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
