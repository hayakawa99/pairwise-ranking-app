'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h2>エラーが発生しました。</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>リトライ</button>
    </div>
  )
}
