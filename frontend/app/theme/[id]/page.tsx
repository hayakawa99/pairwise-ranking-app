"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Theme, Option } from "@types";
import styles from './ThemePage.module.css';

const ThemePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingPairs, setRemainingPairs] = useState<[Option, Option][]>([]);
  const [currentPair, setCurrentPair] = useState<[Option, Option] | null>(null);
  const [hasVotedOnce, setHasVotedOnce] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchTheme = async () => {
      try {
        const res = await fetch(`/api/themes/${id}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Failed to fetch theme: ${res.status} ${res.statusText}, ${errorText}`);
          throw new Error("Failed to fetch theme");
        }
        const data = await res.json();
        setTheme(data);

        const options: Option[] = data.options;
        const pairs: [Option, Option][] = [];
        for (let i = 0; i < options.length; i++) {
          for (let j = i + 1; j < options.length; j++) {
            pairs.push([options[i], options[j]]);
          }
        }

        // レート差に基づいた重み付け
        const weightedPairs = pairs.map(pair => {
          const diff = Math.abs(pair[0].rating - pair[1].rating);
          const weight = 1 / (diff + 1); // 差が小さいほど重み大
          return { pair, weight };
        });

        // 重み付きランダム抽出（without replacement）
        const sampledPairs: [Option, Option][] = [];
        const used = new Set<number>();

        while (sampledPairs.length < weightedPairs.length) {
          const totalWeight = weightedPairs.reduce((acc, e, i) => {
            return used.has(i) ? acc : acc + e.weight;
          }, 0);

          let r = Math.random() * totalWeight;
          for (let i = 0; i < weightedPairs.length; i++) {
            if (used.has(i)) continue;
            r -= weightedPairs[i].weight;
            if (r <= 0) {
              sampledPairs.push(weightedPairs[i].pair);
              used.add(i);
              break;
            }
          }
        }

        setRemainingPairs(sampledPairs);
        setCurrentPair(sampledPairs[0]);
      } catch (error) {
        setError("Error fetching theme");
        console.error("Fetch error:", error);
      }
    };

    fetchTheme();
  }, [id]);

  const handleVote = async (winner: Option, loser: Option) => {
    try {
      const res = await fetch(`/api/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winner_id: winner.id, loser_id: loser.id }),
      });

      if (!res.ok) throw new Error("Failed to submit vote");

      const nextPairs = remainingPairs.slice(1);
      setHasVotedOnce(true);
      sessionStorage.setItem(`voted-theme-${id}`, "1");

      if (nextPairs.length > 0) {
        setRemainingPairs(nextPairs);
        setCurrentPair(nextPairs[0]);
      } else {
        router.push(`/ranking?themeId=${id}`);
      }
    } catch (error) {
      setError("Error submitting vote");
      console.error("Vote error:", error);
    }
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!theme || !currentPair) return <p>Loading...</p>;
  if (theme.options.length < 2) return <p>選択肢が2つ以上必要です。</p>;

  const [optionA, optionB] = currentPair;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{theme.title}</h1>
      <div className={styles.optionsContainer}>
        <h2 className={styles.subtitle}>どちらが良いですか？（残り {remainingPairs.length}）</h2>
        <div className={styles.optionButtons}>
          <button onClick={() => handleVote(optionA, optionB)} className={styles.optionButton}>
            {optionA.label}
          </button>
          <span className={styles.vs}> vs </span>
          <button onClick={() => handleVote(optionB, optionA)} className={styles.optionButton}>
            {optionB.label}
          </button>
        </div>

        {hasVotedOnce && (
          <div className={styles.rankingLink}>
            <button onClick={() => router.push(`/ranking?themeId=${id}`)} className={styles.rankingButton}>
              ランキングを見る
            </button>
          </div>
        )}

        <div className={styles.backButtonWrapper}>
          <button onClick={() => router.push("/")} className={styles.backButton}>
            トップページに戻る
          </button>
        </div>
      </div>
    </main>
  );
};

export default ThemePage;
