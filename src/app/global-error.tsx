"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0f",
          color: "#e4e4e7",
        }}
      >
        <h1 style={{ fontSize: 20, margin: 0 }}>Ошибка приложения</h1>
        <p style={{ fontSize: 14, color: "#a1a1aa", maxWidth: 320, textAlign: "center" }}>
          {error.message || "Не удалось загрузить страницу."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(52,211,153,0.15)",
            color: "#34d399",
            cursor: "pointer",
          }}
        >
          Повторить
        </button>
      </body>
    </html>
  );
}
