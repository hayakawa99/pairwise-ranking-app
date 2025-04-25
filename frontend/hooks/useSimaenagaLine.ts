import { useState, useEffect } from "react";

export function useSimaenagaLine() {
  const [line, setLine] = useState<string>("");

  const fetchLine = async () => {
    try {
      const res = await fetch("/api/simaenaga_lines/random");
      if (!res.ok) throw new Error();
      const data: { text: string } = await res.json();
      setLine(data.text);
    } catch {
      setLine("…");
    }
  };

  useEffect(() => {
    fetchLine();
  }, []);

  return { line, refresh: fetchLine };
}
