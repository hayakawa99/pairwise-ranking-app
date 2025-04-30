"use client";
import { useState, useEffect } from "react";
import { useSimaenagaLine } from "@/hooks/useSimaenagaLine";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Theme, Option } from "@types";
import API_BASE from "@/lib/apiBase";
import styles from "./ThemePage.module.css";

/* ---------- 型 ---------- */
type ApiOption = Omit<Option, "trueskill_mu" | "shown_count"> & {
  trueskill_mu: number | null;
  shown_count: number | null;
};

interface OptionWithStats extends Option {
  mu: number;
  shown_count: number;
}
/* -------------------------------------------------- */

const DEFAULT_MU = Number(process.env.NEXT_PUBLIC_DEFAULT_MU ?? 25);
const BONUS_DIVISOR = Number(process.env.NEXT_PUBLIC_BONUS_DIVISOR ?? 50);
const VOTING_COOLDOWN = Number(
  process.env.NEXT_PUBLIC_VOTING_COOLDOWN_MS ?? 300
);

export default function ThemePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { line, refresh } = useSimaenagaLine();
  const { data: session } = useSession();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPair, setCurrentPair] = useState<[Option, Option] | null>(null);
  const [hasVotedOnce, setHasVotedOnce] = useState(false);
  const [canVote, setCanVote] = useState(false);

  /* -------------------- テーマ取得 -------------------- */
  const fetchTheme = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/themes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch theme");
      const data: Theme & { options?: ApiOption[] } = await res.json();
      setTheme(data);

      const options: ApiOption[] = data.options ?? [];
      if (options.length < 2) return;

      const stats: OptionWithStats[] = options.map((opt) => ({
        ...opt,
        trueskill_mu: opt.trueskill_mu ?? DEFAULT_MU,
        mu: opt.trueskill_mu ?? DEFAULT_MU,
        shown_count: opt.shown_count ?? 0,
      }));

      /* --------- A側抽選 --------- */
      const weightsA = stats.map((o) => {
        const visibility = 1 / (o.shown_count + 1);
        const bonus = 1 + (o.mu - DEFAULT_MU) / BONUS_DIVISOR;
        return visibility * bonus;
      });
      const option1 = weightedSample(stats, weightsA);
      if (!option1) throw new Error("選択肢Aの選出に失敗しました");

      /* --------- B側抽選 --------- */
      const others = stats.filter((o) => o.id !== option1.id);
      const weightsB = others.map((o) => 1 / (Math.abs(o.mu - option1.mu) + 1));
      const option2 = weightedSample(others, weightsB);
      if (!option2) throw new Error("選択肢Bの選出に失敗しました");

      setCurrentPair([option1, option2]);
    } catch (err) {
      console.error(err);
      setError("Error fetching theme");
    }
  };

  useEffect(() => {
    if (id) {
      fetchTheme();
      refresh();
    }
  }, [id]);

  /* -------------------- クールダウン -------------------- */
  useEffect(() => {
    if (!currentPair) return;
    setCanVote(false);
    const t = setTimeout(() => setCanVote(true), VOTING_COOLDOWN);
    return () => clearTimeout(t);
  }, [currentPair]);

  /* -------------------- ローカル投票履歴 -------------------- */
  const recordLocalVote = (winnerId: number, loserId: number) => {
    sessionStorage.setItem(`voted-theme-${id}`, "1");

    const winRaw = sessionStorage.getItem(`voted-options-${id}`);
    const wins: number[] = winRaw ? JSON.parse(winRaw) : [];
    wins.push(winnerId);
    sessionStorage.setItem(`voted-options-${id}`, JSON.stringify(wins));

    const loseRaw = sessionStorage.getItem(`voted-losers-${id}`);
    const loses: number[] = loseRaw ? JSON.parse(loseRaw) : [];
    loses.push(loserId);
    sessionStorage.setItem(`voted-losers-${id}`, JSON.stringify(loses));
  };

  /* -------------------- 投票処理 -------------------- */
  const handleVote = async (winner: Option, loser: Option) => {
    if (!canVote || !session?.user?.email) return;
    try {
      const res = await fetch(`${API_BASE}/api/themes/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winner_id: winner.id,
          loser_id: loser.id,
          user_email: session.user.email,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit vote");

      recordLocalVote(winner.id, loser.id);
      setHasVotedOnce(true);
      await fetchTheme();
      await refresh();
    } catch (err) {
      console.error(err);
      setError("Error submitting vote");
    }
  };

  /* -------------------- ユーティリティ -------------------- */
  const weightedSample = <T,>(arr: T[], weights: number[]): T | null => {
    const total = weights.reduce((a, b) => a + b, 0);
    if (total === 0) return null;
    let acc = 0;
    const r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
      acc += weights[i];
      if (r <= acc) return arr[i];
    }
    return null;
  };

  /* -------------------- 表示 -------------------- */
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
            type="button"
            onClick={() => router.push(`/ranking?themeId=${id}`)}
            className={styles.resultButton}
          >
            ランキングを見る
          </button>
        </div>
      )}

      <div className={styles.back}>
        <button
          type="button"
          onClick={() => router.push("/")}
          className={styles.backButton}
        >
          トップページに戻る
        </button>
      </div>
    </main>
  );
}
