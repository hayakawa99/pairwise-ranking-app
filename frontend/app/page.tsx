"use client";
import { useState, useEffect } from "react";

type Option = {
  label: string;
  rating: number;
};

type Theme = {
  id: number;
  title: string;
  options: Option[];
};

export default function Home() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [title, setTitle] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch("/api/themes");
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

  const submitTheme = async () => {
    const newTheme = {
      title,
      options: [
        { label: optA, rating: 1500 },
        { label: optB, rating: 1500 },
      ],
    };

    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTheme),
      });
      if (!res.ok) {
        throw new Error('Failed to submit theme');
      }

      const createdTheme = await res.json();
      setThemes((prevThemes) => [...prevThemes, createdTheme]);
    } catch (error) {
      setError('Error submitting theme');
      console.error("Submit error:", error);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>お題作成</h1>
      <input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="選択肢A"
        value={optA}
        onChange={(e) => setOptA(e.target.value)}
      />
      <input
        placeholder="選択肢B"
        value={optB}
        onChange={(e) => setOptB(e.target.value)}
      />
      <button onClick={submitTheme}>送信</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>登録済みのお題</h2>
      <ul>
        {themes.map((t) => (
          <li key={t.id}>
            <strong>{t.title}</strong> :{" "}
            {t.options.map((o) => o.label).join(" vs ")}
          </li>
        ))}
      </ul>
    </main>
  );
}
