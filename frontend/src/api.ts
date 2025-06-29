export interface AnalyzeResponse {
  summary: string;
  key_takeaways: string[];
  hashtags: string[];
  twitter_thread: string[];
}

export async function analyzeVideo(youtube_url: string): Promise<AnalyzeResponse> {
  const res = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ youtube_url }),
  });
  if (!res.ok) {
    throw new Error((await res.json()).detail || "Failed to analyze video");
  }
  return res.json();
} 