"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="setup"><section className="panel"><h1>Workspace temporarily unavailable</h1><p>We could not load your workspace. Retry or contact your administrator if this continues.</p><button onClick={reset}>Try again</button></section></main>;
}
