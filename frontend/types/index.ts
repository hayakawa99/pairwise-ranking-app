// frontend/types/index.ts
export interface Option {
  id: number;
  label: string; // ✅ name → label に修正
  rating: number;
}

export interface Theme {
  id: number;
  title: string;
  options: Option[];
}
