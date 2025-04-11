"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // useParamsをインポート
import { Theme } from "@types";
import styles from './ThemePage.module.css';  // ここでCSSモジュールをインポート

const ThemePage = () => {
  const { id } = useParams();  // useParamsで動的ルートパラメータを取得
  const [theme, setTheme] = useState<Theme | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;  // idがまだ取得されていない場合、APIリクエストをしない

    const fetchTheme = async () => {
      try {
        const res = await fetch(`/api/themes/${id}`);
        if (!res.ok) {
          const errorText = await res.text();  // エラーメッセージを取得
          console.error(`Failed to fetch theme: ${res.status} ${res.statusText}, ${errorText}`);
          throw new Error("Failed to fetch theme");
        }
        const data = await res.json();
        setTheme(data);
      } catch (error) {
        setError("Error fetching theme");
        console.error("Fetch error:", error);
      }
    };

    fetchTheme();
  }, [id]);  // idが変更される度にデータを再取得

  const handleVote = async (selectedOption: string) => {
    try {
      const res = await fetch(`/api/themes/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOption }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit vote");
      }

      alert("Vote submitted successfully!");
    } catch (error) {
      setError("Error submitting vote");
      console.error("Vote error:", error);
    }
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!theme) return <p>Loading...</p>;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{theme.title}</h1>
      <div className={styles.optionsContainer}>
        <h2 className={styles.subtitle}>選択してください</h2>
        <div className={styles.optionButtons}>
          <button onClick={() => handleVote(theme.options[0].label)} className={styles.optionButton}>
            {theme.options[0].label}
          </button>
          <span className={styles.vs}> vs </span>
          <button onClick={() => handleVote(theme.options[1].label)} className={styles.optionButton}>
            {theme.options[1].label}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ThemePage;
