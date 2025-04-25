// 共通 API ベース URL 判定
const API_BASE: string = (() => {
    // .env.local が最優先
    const env = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (env && env.trim() !== "") return env.trim();
  
    // ブラウザ実行時はホスト名に合わせポート 8000 を付与
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
  
    // SSR / ビルド時フォールバック
    return "http://localhost:8000";
  })();
  
  export default API_BASE;
  