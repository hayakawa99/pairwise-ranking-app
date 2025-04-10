"use client";
import { useState, useEffect } from "react";

type Option = {
  id: number;
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

  useEffect(() => {
    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => setThemes(data))
      .catch((error) => console.error("Fetch error:", error));
  }, []);

  const submitTheme = async () => {
    const newTheme: Theme = {
      id: Date.now(),
      title,
      options: [
        { id: 1, label: optA, rating: 1500 },
        { id: 2, label: optB, rating: 1500 },
      ],
    };
    await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTheme),
    });
    location.reload();
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
