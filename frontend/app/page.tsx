"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from './MainPage.module.css';

type Theme = {
  id: number;
  title: string;
};

export default function MainPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`);
        if (!res.ok) {
          throw new Error('Failed to fetch themes');
        }
        const data = await res.json();
        setThemes(data);
      } catch (error) {
        setError('Error fetching themes');
        console.error("Fetch error:", error);
      }
    };

    fetchThemes();
  }, []);

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Pairwise Ranking</h1>

      <button
        className={styles.createButton}
        onClick={() => router.push("/create-topic")}
      >
        お題作成
      </button>

      {error && <p className={styles.error}>{error}</p>}

      <h2 className={styles.subHeading}>お題一覧</h2>
      <div className={styles.themeList}>
        {themes.length > 0 ? (
          themes.map((theme) => (
            <div
              key={theme.id}
              className={styles.themeCard}
              onClick={() => router.push(`/theme/${theme.id}`)}
              style={{ cursor: "pointer" }} // マウスオーバーでわかりやすく
            >
              <h3 className={styles.themeTitle}>{theme.title}</h3>
            </div>
          ))
        ) : (
          <p>お題がまだ登録されていません。</p>
        )}
      </div>
    </main>
  );
}
