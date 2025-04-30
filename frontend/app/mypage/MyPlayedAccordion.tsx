"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import styles from "./MyPlayedAccordion.module.css";

type PlayedTheme = {
  id: number;
  title: string;
};

type Props = {
  themes: PlayedTheme[];
  heading: ReactNode;
};

/**
 * 自分が遊んだお題をアコーディオン形式で表示する
 * - 見出し行をクリックすると一覧の表示 / 非表示が切り替わる
 * - 各行をクリックすると自分の投票のみで形成されたランキングへ遷移
 */
export default function MyPlayedAccordion({ themes, heading }: Props) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);

  return (
    <section className={styles.section}>
      <button type="button" className={styles.summary} onClick={toggle}>
        {heading} ({themes.length}) {open ? "▲" : "▼"}
      </button>

      {open && (
        <ul className={styles.list}>
          {themes.map((t) => (
            <li key={t.id} className={styles.listItem}>
              <Link
                href={`/ranking?themeId=${t.id}&mine=1`}
                className={styles.link}
              >
                {t.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
