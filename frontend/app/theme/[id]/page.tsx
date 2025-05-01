"use client";

import { useState, useEffect } from "react";
import { useSimaenagaLine } from "@/hooks/useSimaenagaLine";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Theme, Option } from "@types";
import API_BASE from "@/lib/apiBase";
import styles from "./ThemePage.module.css";

/* ---------- 型定義 ---------- */
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

  /* テーマと選択肢取得 */
  const fetchTheme = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/themes/${id}`);
      if (!res.ok) throw new Error("テーマの取得に失敗しました");
      const data: Theme & { options?: ApiOption[] } = await res.json();
      setTheme(data);

      const opts = data.options ?? [];
      if (opts.length < 2) return;

      const stats: OptionWithStats[] = opts.map((o) => ({
        ...o,
        mu: o.trueskill_mu ?? DEFAULT_MU,
        shown_count: o.shown_count ?? 0,
      }));

      // A側抽選
      const weightsA = stats.map((o) => {
        const vis = 1 / (o.shown_count + 1);
        const bonus = 1 + (o.mu - DEFAULT_MU) / BONUS_DIVISOR;
        return vis * bonus;
      });
      const option1 = weightedSample(stats, weightsA)!;

      // B側抽選
      const others = stats.filter((o) => o.id !== option1.id);
      const weightsB = others.map((o) => 1 / (Math.abs(o.mu - option1.mu) + 1));
      const option2 = weightedSample(others, weightsB)!;

      setCurrentPair([option1, option2]);
    } catch (e) {
      console.error(e);
      setError("テーマの読み込み中にエラーが発生しました");
    }
  };

  useEffect(() => {
    if (id) {
      fetchTheme();
      refresh();
    }
  }, [id]);

  /* 投票クールダウン */
  useEffect(() => {
    if (!currentPair) return;
    setCanVote(false);
    const t = setTimeout(() => setCanVote(true), VOTING_COOLDOWN);
    return () => clearTimeout(t);
  }, [currentPair]);

  /* ローカル投票履歴登録 */
  const recordLocalVote = (winnerId: number, loserId: number) => {
    sessionStorage.setItem(`voted-theme-${id}`, "1");
    const wins = JSON.parse(
      sessionStorage.getItem(`voted-options-${id}`) || "[]"
    ) as number[];
    const loses = JSON.parse(
      sessionStorage.getItem(`voted-losers-${id}`) || "[]"
    ) as number[];
    sessionStorage.setItem(
      `voted-options-${id}`,
      JSON.stringify([...wins, winnerId])
    );
    sessionStorage.setItem(
      `voted-losers-${id}`,
      JSON.stringify([...loses, loserId])
    );
  };

  /* 投票処理 */
  const handleVote = async (winner: Option, loser: Option) => {
    if (!canVote) return;

    try {
      type VotePayload = {
        winner_id: number;
        loser_id: number;
        user_email?: string;
      };
      const payload: VotePayload = {
        winner_id: winner.id,
        loser_id: loser.id,
        ...(session?.user?.email && { user_email: session.user.email }),
      };

      // ← ここを /api/themes/{id}/vote に合わせました
      const res = await fetch(`${API_BASE}/api/themes/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("vote failed:", res.status, text);
        throw new Error("投票に失敗しました");
      }

      recordLocalVote(winner.id, loser.id);
      setHasVotedOnce(true);
      await fetchTheme();
      await refresh();
    } catch (e) {
      console.error(e);
      setError("投票処理中にエラーが発生しました");
    }
  };

  /* 重み付きサンプリング */
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

  /* 描画 */
  if (error) return <p className={styles.error}>{error}</p>;
  if (!theme || !currentPair) return <p>Loading…</p>;
  if ((theme.options ?? []).length < 2) return <p>選択肢が2つ以上必要です。</p>;

  const [optA, optB] = currentPair;
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{theme.title}</h1>
      <p className={styles.subtitle}>あなたならどっち？</p>

      <div className={styles.options}>
        <button
          onClick={() => handleVote(optA, optB)}
          className={`${styles.option} ${
            canVote ? styles.enabled : styles.waiting
          }`}
          disabled={!canVote}
        >
          {optA.label}
        </button>
        <span className={styles.vs}>vs</span>
        <button
          onClick={() => handleVote(optB, optA)}
          className={`${styles.option} ${
            canVote ? styles.enabled : styles.waiting
          }`}
          disabled={!canVote}
        >
          {optB.label}
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
}
