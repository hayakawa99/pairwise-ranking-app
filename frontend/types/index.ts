// frontend/types/index.ts
export interface Option {
  mu: any;
  id: number;
  label: string;
  trueskill_mu: number;
  trueskill_sigma: number;
  shown_count: number;
}

export interface Theme {
  id: number;
  title: string;
  options: Option[];
}
