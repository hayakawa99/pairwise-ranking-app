"use client";
import { useEffect, useState } from 'react';
import { Theme, Option } from '@types';

export default function RankingPage() {
  const [data, setData] = useState<Theme[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('ランキング取得失敗', err));
  }, []);

  return (
    <div>
      <h1>ランキング一覧</h1>
      <ul>
        {data.map((theme: Theme) => (
          <li key={theme.id}>
            <h2>{theme.title}</h2>
            <ul>
              {theme.options
                ?.sort((a: Option, b: Option) => b.rating - a.rating)
                .map((option: Option) => (
                  <li key={option.id}>
                    {option.label} - {option.rating.toFixed(2)}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
