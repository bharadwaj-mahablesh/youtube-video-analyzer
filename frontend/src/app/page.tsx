"use client";
import React, { useState } from "react";
import { Container, Box, CircularProgress, Alert, Typography, Paper, Chip, Stack, Card, CardContent, Divider, Button, Link } from "@mui/material";
import InputForm from "../components/InputForm";
import TwitterIcon from '@mui/icons-material/Twitter';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TagIcon from '@mui/icons-material/Tag';
import { analyzeVideo, AnalyzeResponse } from "../api";

const EXAMPLES = [
  { label: "Me at the zoo (First YouTube video)", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  { label: "Rick Astley - Never Gonna Give You Up", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
];

export default function HomePage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState<'ollama' | 'openai'>('ollama');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');

  const handleSubmit = async (url: string, prov: string, apiKey?: string) => {
    setProvider(prov as 'ollama' | 'openai');
    if (prov === 'openai' && apiKey) setOpenaiApiKey(apiKey);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeVideo(url, prov, apiKey);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f7fb' }}>
      {/* Header */}
      <Box sx={{
        width: '100%',
        py: 5,
        background: 'linear-gradient(90deg, #4f8a8b 0%, #cfd9df 100%)',
        mb: 4,
        boxShadow: 2,
      }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">
            <img src="/youtube.svg" alt="YouTube" width={40} height={40} />
            <Typography variant="h3" fontWeight={700} color="#22313f">
              YouTube Video Analyzer <span role="img" aria-label="sparkles">✨</span>
            </Typography>
          </Stack>
          <Typography variant="h6" align="center" color="#22313f" sx={{ mt: 1 }}>
            Extract transcripts, get AI summaries, and generate engaging tweets
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
            <Chip label="⚡ Powered by LLM" color="warning" variant="outlined" />
            <Chip label="🟢 Live Analysis" color="success" variant="outlined" />
          </Stack>
        </Container>
      </Box>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <InputForm onSubmit={handleSubmit} loading={loading} />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Supports videos with captions • Powered by AI
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Try these example videos:
            </Typography>
            <Stack direction="row" spacing={2}>
              {EXAMPLES.map(ex => (
                <Link key={ex.url} href="#" underline="hover" onClick={() => handleSubmit(ex.url, provider, provider === 'openai' ? openaiApiKey : undefined)}>
                  {ex.label}
                </Link>
              ))}
            </Stack>
          </Box>
        </Paper>
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {result && (
          <Box>
            {/* Sentiment badge placeholder */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Chip label="Sentiment: Positive" color="success" icon={<span>😊</span>} />
            </Stack>
            {/* Summary */}
            <Card sx={{ mb: 3, background: '#f3e8ff', borderLeft: '6px solid #a18cd1' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SummarizeIcon color="primary" />
                  <Typography variant="h6" fontWeight={600} color="#4b2994">Executive Summary</Typography>
                </Stack>
                <Typography variant="body1" sx={{ mt: 1 }}>{result.summary}</Typography>
              </CardContent>
            </Card>
            {/* Key Takeaways */}
            <Card sx={{ mb: 3, background: '#fffbe6', borderLeft: '6px solid #ffe066' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LightbulbIcon color="warning" />
                  <Typography variant="h6" fontWeight={600} color="#b59f3b">Key Takeaways</Typography>
                </Stack>
                <Box sx={{ mt: 1 }}>
                  {result.key_takeaways.length === 0 ? (
                    <Typography color="text.secondary">No key takeaways generated.</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {result.key_takeaways.map((takeaway, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Chip label={idx + 1} size="small" sx={{ bgcolor: '#ffe066', color: '#b59f3b', fontWeight: 700, mr: 1 }} />
                          <Typography variant="body1">{takeaway}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
            {/* Hashtags */}
            <Card sx={{ mb: 3, background: '#e3f2fd', borderLeft: '6px solid #42a5f5' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TagIcon color="primary" />
                  <Typography variant="h6" fontWeight={600} color="#1976d2">Main Topics</Typography>
                </Stack>
                <Box sx={{ mt: 1 }}>
                  {result.hashtags.length === 0 ? (
                    <Typography color="text.secondary">No hashtags generated.</Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {result.hashtags.map((tag, idx) => (
                        <Chip key={idx} label={tag} color="primary" variant="outlined" sx={{ mb: 1 }} />
                      ))}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
            {/* Twitter Thread */}
            <Typography variant="h6" fontWeight={600} color="#1976d2" sx={{ mb: 1, mt: 2 }}>
              <TwitterIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />Generated Tweets
            </Typography>
            <Stack spacing={2}>
              {result.twitter_thread.length === 0 ? (
                <Typography color="text.secondary">No tweets generated.</Typography>
              ) : (
                result.twitter_thread.map((tweet, idx) => (
                  <Card key={idx} sx={{ background: '#e3f2fd', borderLeft: '6px solid #42a5f5' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TwitterIcon color="primary" />
                        <Typography variant="subtitle2" color="text.secondary">Tweet {idx + 1}</Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ mt: 1 }}>{tweet}</Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
