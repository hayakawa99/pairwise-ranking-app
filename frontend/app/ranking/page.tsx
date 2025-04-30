"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Theme, Option } from "@types";
import API_BASE from "@/lib/apiBase";
import styles from "./RankingPage.module.css";

export default function RankingPage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [winMap, setWinMap] = useState<Map<number, number>>(new Map());
  const [loseMap, setLoseMap] = useState<Map<number, number>>(new Map());

  const params = useSearchParams();
  const router = useRouter();
  const themeId = params?.get("themeId") ?? null;
  const mineMode = params?.get("mine") === "1";

  /* -------------------- データ取得 -------------------- */
  useEffect(() => {
    if (!themeId) return;

    if (!sessionStorage.getItem(`voted-theme-${themeId}`)) {
      router.replace(`/theme/${themeId}`);
      return;
    }

    const wins = sessionStorage.getItem(`voted-options-${themeId}`);
    if (wins) {
      const arr = JSON.parse(wins) as number[];
      const m = new Map<number, number>();
      arr.forEach((id) => m.set(id, (m.get(id) || 0) + 1));
      setWinMap(m);
    }

    const loses = sessionStorage.getItem(`voted-losers-${themeId}`);
    if (loses) {
      const arr = JSON.parse(loses) as number[];
      const m = new Map<number, number>();
      arr.forEach((id) => m.set(id, (m.get(id) || 0) + 1));
      setLoseMap(m);
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/themes/${themeId}/ranking`);
        if (!res.ok) throw new Error("fetch fail");
        setTheme((await res.json()) as Theme);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [themeId, router]);

  if (!theme) return <p>Loading...</p>;

  /* -------------------- 並べ替え -------------------- */
  const sortedOptions: Option[] = mineMode
    ? (() => {
        const opts = theme.options.filter(
          (o) => (winMap.get(o.id) ?? 0) + (loseMap.get(o.id) ?? 0) > 0
        );
        return opts.sort((a, b) => {
          const sA = (winMap.get(a.id) ?? 0) - (loseMap.get(a.id) ?? 0);
          const sB = (winMap.get(b.id) ?? 0) - (loseMap.get(b.id) ?? 0);
          return sB - sA;
        });
      })()
    : theme.options;

  /* -------------------- 戻り先設定 -------------------- */
  const backHref = mineMode ? "/mypage" : "/";
  const backLabel = mineMode ? "マイページに戻る" : "トップページに戻る";

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        {theme.title}
        <br />
        {mineMode ? "あなたの投票ランキング" : "全体ランキング"}
      </h1>

      <div className={styles.backButtonWrapper}>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className={styles.backButton}
        >
          {backLabel}
        </button>
      </div>

      <div className={styles.rankings}>
        <div className={styles.themeCard}>
          <div className={styles.optionsList}>
            {sortedOptions.map((opt: Option, idx: number) => {
              const rankCls =
                idx === 0
                  ? styles["rank-1"]
                  : idx === 1
                  ? styles["rank-2"]
                  : idx === 2
                  ? styles["rank-3"]
                  : "";

              const rankIcon = `${idx + 1}`;
              const wins = winMap.get(opt.id) ?? 0;
              const loses = loseMap.get(opt.id) ?? 0;

              let votedCls = "";
              if (wins >= 5) votedCls = styles.votedStrong;
              else if (wins >= 2) votedCls = styles.votedMid;
              else if (wins === 1) votedCls = styles.voted1;

              const lowered = loses >= 2 ? styles.lowered : "";

              return (
                <div
                  key={opt.id}
                  className={`${styles.optionCard} ${rankCls} ${votedCls} ${lowered}`}
                >
                  <div className={styles.rankIcon}>{rankIcon}</div>
                  <div className={styles.optionLabel}>{opt.label}</div>
                </div>
              );
            })}
            {mineMode && sortedOptions.length === 0 && (
              <p className={styles.noData}>
                まだこのお題では投票していません。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
