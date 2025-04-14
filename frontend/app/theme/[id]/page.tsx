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
        for (let i = pairs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        setRemainingPairs(pairs);
        setCurrentPair(pairs[0]);
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

      if (nextPairs.length > 0) {
        setRemainingPairs(nextPairs);
        setCurrentPair(nextPairs[0]);
      } else {
        router.push(`/ranking?themeId=${id}`); // ✅ 修正済：直前のテーマIDで遷移
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
