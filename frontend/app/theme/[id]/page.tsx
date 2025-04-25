"use client";
import { useState, useEffect } from "react";
import { useSimaenagaLine } from "@/hooks/useSimaenagaLine";
import { useParams, useRouter } from "next/navigation";
import { Theme, Option } from "@types";
import styles from "./ThemePage.module.css";

// .env.local で定義
const DEFAULT_MU = Number(process.env.NEXT_PUBLIC_DEFAULT_MU ?? 25);
const BONUS_DIVISOR = Number(process.env.NEXT_PUBLIC_BONUS_DIVISOR ?? 50);
const VOTING_COOLDOWN = Number(
  process.env.NEXT_PUBLIC_VOTING_COOLDOWN_MS ?? 300
);

const ThemePage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { line, refresh } = useSimaenagaLine();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPair, setCurrentPair] = useState<[Option, Option] | null>(null);
  const [hasVotedOnce, setHasVotedOnce] = useState(false);
  const [canVote, setCanVote] = useState(false);

  const fetchTheme = async () => {
    try {
      const res = await fetch(`/api/themes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch theme");
      const data = await res.json();
      setTheme(data);

      const options = data.options;
      if (!Array.isArray(options) || options.length < 2) return;

      // trueskill_mu がないときは DEFAULT_MU を使う
      const optionsWithStats = options.map((opt) => ({
        ...opt,
        mu: opt.trueskill_mu ?? DEFAULT_MU,
        shown_count: opt.shown_count,
      }));

      // A 選択肢の重み = (1 / (shown_count + 1)) × (1 + (mu - DEFAULT_MU) / BONUS_DIVISOR)
      const weightsA = optionsWithStats.map((opt) => {
        const visibility = 1 / (opt.shown_count + 1);
        const bonus = 1 + (opt.mu - DEFAULT_MU) / BONUS_DIVISOR;
        return visibility * bonus;
      });
      const totalA = weightsA.reduce((a, b) => a + b, 0);
      if (totalA === 0) throw new Error("選択肢Aの重みが全て0です");

      let accA = 0;
      const randA = Math.random() * totalA;
      let option1: Option | null = null;
      for (let i = 0; i < optionsWithStats.length; i++) {
        accA += weightsA[i];
        if (randA <= accA) {
          option1 = optionsWithStats[i];
          break;
        }
      }
      if (!option1) throw new Error("選択肢Aの選出に失敗しました");

      // B 選択肢は mu の差が小さいほど選ばれやすい
      const others = optionsWithStats.filter((opt) => opt.id !== option1.id);
      const weightsB = others.map(
        (opt) => 1 / (Math.abs(opt.mu - option1.mu) + 1)
      );
      const totalB = weightsB.reduce((a, b) => a + b, 0);
      if (totalB === 0) throw new Error("選択肢Bの重みが全て0です");

      let accB = 0;
      const randB = Math.random() * totalB;
      let option2: Option | null = null;
      for (let i = 0; i < others.length; i++) {
        accB += weightsB[i];
        if (randB <= accB) {
          option2 = others[i];
          break;
        }
      }
      if (!option2) throw new Error("選択肢Bの選出に失敗しました");

      setCurrentPair([option1, option2]);
      setCanVote(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching theme");
    }
  };

  useEffect(() => {
    if (id) {
      fetchTheme();
      refresh();
    }
  }, [id]);

  useEffect(() => {
    if (!currentPair) return;
    setCanVote(false);
    const timeout = setTimeout(() => setCanVote(true), VOTING_COOLDOWN);
    return () => clearTimeout(timeout);
  }, [currentPair]);

  const handleVote = async (winner: Option, loser: Option) => {
    if (!canVote) return;
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winner_id: winner.id, loser_id: loser.id }),
      });
      if (!res.ok) throw new Error("Failed to submit vote");

      setHasVotedOnce(true);
      sessionStorage.setItem(`voted-theme-${id}`, "1");

      const winKey = `voted-options-${id}`;
      const loseKey = `voted-losers-${id}`;
      const prevWins = JSON.parse(sessionStorage.getItem(winKey) || "[]");
      const prevLosses = JSON.parse(sessionStorage.getItem(loseKey) || "[]");
      sessionStorage.setItem(winKey, JSON.stringify([...prevWins, winner.id]));
      sessionStorage.setItem(
        loseKey,
        JSON.stringify([...prevLosses, loser.id])
      );

      await fetchTheme();
      await refresh();
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
          className={`${styles.option} ${
            canVote ? styles.enabled : styles.waiting
          }`}
          disabled={!canVote}
        >
          {optionA.label}
        </button>
        <span className={styles.vs}>vs</span>
        <button
          onClick={() => handleVote(optionB, optionA)}
          className={`${styles.option} ${
            canVote ? styles.enabled : styles.waiting
          }`}
          disabled={!canVote}
        >
          {optionB.label}
        </button>
      </div>

      <div className={styles.characterWrapper}>
        {line && (
          <div className={styles.speechBubble}>
            <p>{line}</p>
          </div>
        )}
        <img
          src="/simaenaga2.png"
          alt="シマエナガ"
          className={styles.character}
        />
      </div>

      {hasVotedOnce && (
        <div className={styles.result}>
          <button
            onClick={() => router.push(`/ranking?themeId=${id}`)}
            className={styles.resultButton}
          >
            ランキングを見る
          </button>
        </div>
      )}

      <div className={styles.back}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          トップページに戻る
        </button>
      </div>
    </main>
  );
};

export default ThemePage;
