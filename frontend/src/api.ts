export interface TranscriptLine {
  start: number;
  text: string;
}

export interface AnalyzeResponse {
  id: string; // UUID for the analysis
  summary: string;
  key_takeaways: string[];
  hashtags: string[];
  twitter_thread: string[];
  transcript: TranscriptLine[];
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  credits_remaining?: number; // Added for credit tracking
}

export interface UserInfoResponse {
  tier: string;
  credits_remaining: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function analyzeVideo(url: string, token: string): Promise<AnalyzeResponse> {
  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ youtube_url: url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze video');
  }

  return response.json();
}

export async function submitFeedback(analysis_id: string, rating: number, comment: string, token: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ analysis_id, rating, comment }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit feedback');
    }

    return response.json();
}

export async function fetchUserInfo(token: string): Promise<UserInfoResponse> {
    const response = await fetch(`${BACKEND_URL}/user_info`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch user info');
    }

    return response.json();
}

export async function upgradeToPro(token: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/upgrade`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upgrade');
    }

    return response.json();
}