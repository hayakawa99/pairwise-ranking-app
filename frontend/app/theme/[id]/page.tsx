"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Theme, Option } from "@types";
import styles from "./ThemePage.module.css";

const ThemePage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingPairs, setRemainingPairs] = useState<[Option, Option][]>([]);
  const [currentPair, setCurrentPair] = useState<[Option, Option] | null>(null);
  const [hasVotedOnce, setHasVotedOnce] = useState(false);
  const [canVote, setCanVote] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await fetch(`/api/themes/${id}`);
        if (!res.ok) throw new Error("Failed to fetch theme");
        const data = await res.json();
        setTheme(data);

        const options = data.options;
        const pairs: [Option, Option][] = [];
        for (let i = 0; i < options.length; i++) {
          for (let j = i + 1; j < options.length; j++) {
            pairs.push([options[i], options[j]]);
          }
        }

        const weightedPairs = pairs.map(pair => {
          const diff = Math.abs(pair[0].rating - pair[1].rating);
          return { pair, weight: 1 / (diff + 1) };
        });

        const sampledPairs: [Option, Option][] = [];
        const used = new Set<number>();
        while (sampledPairs.length < weightedPairs.length) {
          const total = weightedPairs.reduce((acc, e, i) => used.has(i) ? acc : acc + e.weight, 0);
          let r = Math.random() * total;
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
        setCanVote(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Error fetching theme");
      }
    };

    fetchTheme();
  }, [id]);

  useEffect(() => {
    if (!currentPair) return;

    setCanVote(false);
    const timeout = setTimeout(() => {
      setCanVote(true);
    }, 3500);

    return () => clearTimeout(timeout);
  }, [currentPair]);

  const handleVote = async (winner: Option, loser: Option) => {
    if (!canVote) return;

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

      const key = `voted-options-${id}`;
      let updated: number[] = [];
      try {
        const prev = sessionStorage.getItem(key);
        updated = prev ? JSON.parse(prev) : [];
      } catch {
        updated = [];
      }
      updated.push(winner.id);
      sessionStorage.setItem(key, JSON.stringify(updated));

      const loserKey = `voted-losers-${id}`;
      let loserHistory: number[] = [];
      try {
        const prevLosers = sessionStorage.getItem(loserKey);
        loserHistory = prevLosers ? JSON.parse(prevLosers) : [];
      } catch {
        loserHistory = [];
      }
      loserHistory.push(loser.id);
      sessionStorage.setItem(loserKey, JSON.stringify(loserHistory));

      if (nextPairs.length > 0) {
        setRemainingPairs(nextPairs);
        setCurrentPair(nextPairs[0]);
      } else {
        router.push(`/ranking?themeId=${id}`);
      }
    } catch (err) {
      console.error("Vote error:", err);
      setError("Error submitting vote");
    }
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!theme || !currentPair) return <p>Loading...</p>;
  if (theme.options.length < 2) return <p>選択肢が2つ以上必要です。</p>;

  const [optionA, optionB] = currentPair;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{theme.title}</h1>
      <p className={styles.subtitle}>あなたならどっち？</p>

      <div className={styles.options}>
        <button
          onClick={() => handleVote(optionA, optionB)}
          className={`${styles.option} ${canVote ? styles.enabled : ""}`}
          disabled={!canVote}
        >
          {optionA.label}
        </button>
        <span className={styles.vs}>vs</span>
        <button
          onClick={() => handleVote(optionB, optionA)}
          className={`${styles.option} ${canVote ? styles.enabled : ""}`}
          disabled={!canVote}
        >
          {optionB.label}
        </button>
      </div>

      {hasVotedOnce && (
        <div className={styles.result}>
          <button onClick={() => router.push(`/ranking?themeId=${id}`)} className={styles.resultButton}>
            ランキングを見る
          </button>
        </div>
      )}

      <div className={styles.back}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          トップページに戻る
        </button>
      </div>

      <img src="/simaenaga2.png" alt="シマエナガ" className={styles.character} />
    </main>
  );
};

export default ThemePage;
