"use client";
import React, { useState, useEffect } from "react";
import { Container, Box, CircularProgress, Alert, Typography, Paper, Chip, Stack, Card, CardContent, Button, Link, Grid, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import InputForm from "../components/InputForm";
import SummaryCard from "../components/SummaryCard";
import FeedbackForm from "../components/FeedbackForm";
import TopComments from "../components/TopComments";
import TwitterIcon from '@mui/icons-material/Twitter';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TagIcon from '@mui/icons-material/Tag';
import { analyzeVideo, submitFeedback, fetchUserInfo, upgradeToPro, createRazorpayOrder, AnalyzeResponse, UserInfoResponse } from "../api";
import UserInfo from "../components/UserInfo";
import { useUser, SignInButton, SignOutButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Logout, Upgrade } from '@mui/icons-material';

const EXAMPLES = [
  { label: "Me at the zoo", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  { label: "Rick Astley", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
];

export default function HomePage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isSignedIn, user } = useUser();
  const [userInfo, setUserInfo] = useState<UserInfoResponse>({ tier: 'free', credits_remaining: 0 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"exhausted_credits" | "pro_tier_promo" | null>(null);

  

  useEffect(() => {
    const getUserCredits = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            const data = await fetchUserInfo(token);
            setUserInfo(data);
          }
        } catch (err) {
          console.error("Failed to fetch user info:", err);
        }
      }
    };
    getUserCredits();

    if (!isSignedIn) {
      setAnchorEl(null);
      setResult(null); // Clear analysis results on sign out
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    // Check for upgrade action in URL
    if (router.isReady && router.query && router.query.action === 'upgrade' && isSignedIn) {
      setUpgradeReason('pro_tier_promo');
      setUpgradeModalOpen(true);
      router.replace({ query: {} });
    }
  }, [isSignedIn, router.isReady, router.query]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpgrade = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication failed');

      const order = await createRazorpayOrder(token);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 means 50000 paise or ₹500.
        currency: order.currency,
        name: "YouTube Video Insights",
        description: "Pro Tier Upgrade",
        order_id: order.order_id, // Pass the `order_id` obtained in the previous step
        handler: async function (response: any) {
          // This function is called when the payment is successful
          // You would typically verify the payment on your backend here
          // For now, we'll just update the user's tier directly
          await upgradeToPro(token);
          const data = await fetchUserInfo(token);
          setUserInfo(data);
          setUpgradeModalOpen(false);
          handleMenuClose();
          alert("Upgrade successful!");
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#3f51b5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Failed to initiate upgrade');
    }
  };

  const handleSubmit = async (url: string) => {
    if (userInfo.tier === 'free' && userInfo.credits_remaining <= 0) {
      setUpgradeReason('exhausted_credits');
      setUpgradeModalOpen(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication failed');
      const result = await analyzeVideo(url, token);
      setResult(result);
      if (result.credits_remaining !== undefined) {
        setUserInfo(prev => ({ ...prev, credits_remaining: result.credits_remaining as number }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze video');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (analysisId: string, rating: number, comment: string) => {
    try {
        const token = await getToken();
        if (!token) throw new Error('Authentication failed');
        await submitFeedback(analysisId, rating, comment, token);
        alert("Feedback submitted successfully!");
    } catch (err: any) {
        setError(err.message || 'Failed to submit feedback');
    }
  };

  if (!isSignedIn) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f0f2f5', py: 4 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <YouTubeIcon sx={{ fontSize: 80, color: '#ff0000', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#3f51b5' }}>
            YouTube Video Insights
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Unlock the power of YouTube videos with AI-driven insights. Get instant summaries, key takeaways, relevant hashtags, and ready-to-share Twitter threads from any YouTube video.
          </Typography>
          <SignInButton mode="modal">
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                mt: 2,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 18,
                px: 5,
                py: 1.5,
                boxShadow: '0px 6px 20px rgba(63, 81, 181, 0.4)',
                textTransform: 'none',
              }}
            >
              Sign in to Get Started
            </Button>
          </SignInButton>

          <Grid container spacing={4} sx={{ mt: 6 }} justifyContent="center" alignItems="stretch">
            {/* Pricing Tiers Section */}
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#3f51b5', mb: 3, textAlign: 'center' }}>
                Pricing Tiers
              </Typography>
              <Grid container spacing={2} justifyContent="center" alignItems="stretch">
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 300, width: '100%' }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#4caf50' }}>
                        Free Tier
                      </Typography>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        ₹0<Typography component="span" variant="h6" color="text.secondary">/month</Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Perfect for casual users and trying out the service.
                      </Typography>
                      <Stack component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        <Typography component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="5" size="small" color="primary" /> Analyses per month
                        </Typography>
                        <Typography component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Basic AI features
                        </Typography>
                      </Stack>
                    </Box>
                    <SignInButton mode="modal">
                      <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2, textTransform: 'none' }}>
                        Start for Free
                      </Button>
                    </SignInButton>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 300, width: '100%' }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#9c27b0' }}>
                        Pro Tier
                      </Typography>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        ₹99<Typography component="span" variant="h6" color="text.secondary">/month</Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        For power users who need unlimited access and advanced features.
                      </Typography>
                      <Stack component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        <Typography component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Unlimited" size="small" color="secondary" /> Analyses
                        </Typography>
                        <Typography component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Priority support
                        </Typography>
                        <Typography component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Early access to new features
                        </Typography>
                      </Stack>
                    </Box>
                    <SignInButton mode="modal" redirectUrl="/?action=upgrade">
                      <Button variant="contained" color="secondary" fullWidth sx={{ mt: 2, textTransform: 'none' }}>
                        Upgrade Now
                      </Button>
                    </SignInButton>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <Box
        sx={{
          width: '100%',
          py: 3,
          background: 'linear-gradient(90deg, #673ab7 0%, #9c27b0 100%)',
          mb: 4,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <img src="/youtube.svg" alt="YouTube" width={35} height={35} />
              <Typography variant="h5" fontWeight={700}>
                YouTube Video Insights
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar onClick={handleMenuClick} sx={{ cursor: 'pointer' }}>
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {userInfo.tier === 'free' && (
                  <MenuItem onClick={() => setUpgradeModalOpen(true)}>
                    <ListItemIcon>
                      <Upgrade fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Upgrade to Pro</ListItemText>
                  </MenuItem>
                )}
                <SignOutButton>
                  <MenuItem>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Sign Out</ListItemText>
                  </MenuItem>
                </SignOutButton>
              </Menu>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <UserInfo tier={userInfo.tier} credits={userInfo.credits_remaining} />
          <InputForm onSubmit={handleSubmit} loading={loading} />
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Supports videos with captions • Powered by AI
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Try these example videos:
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {EXAMPLES.map(ex => (
                <Link key={ex.url} href="#" onClick={() => handleSubmit(ex.url)} sx={{ textDecoration: 'none' }}>
                  <Chip label={ex.label} clickable color="info" variant="outlined" size="small" />
                </Link>
              ))}
            </Stack>
          </Box>
        </Paper>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box>
            <SummaryCard
              title={result.title || "Video Title Not Available"}
              channel={result.channel_name || "Channel Not Available"}
              thumbnail={result.thumbnail_url || "/youtube.svg"}
              summary={result.summary}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#e8f5e9', borderLeft: '6px solid #4caf50', borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <LightbulbIcon color="success" />
                      <Typography variant="h6" fontWeight={600} color="#388e3c">Key Takeaways</Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {result.key_takeaways.length === 0 ? (
                        <Typography color="text.secondary">No key takeaways generated.</Typography>
                      ) : (
                        result.key_takeaways.map((takeaway, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Chip label={idx + 1} size="small" sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 700, mr: 1 }} />
                            <Typography variant="body1">{takeaway}</Typography>
                          </Box>
                        ))
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#e3f2fd', borderLeft: '6px solid #2196f3', borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <TagIcon color="primary" />
                      <Typography variant="h6" fontWeight={600} color="#1976d2">Main Topics</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {result.hashtags.length === 0 ? (
                        <Typography color="text.secondary">No hashtags generated.</Typography>
                      ) : (
                        result.hashtags.map((tag, idx) => (
                          <Chip key={idx} label={tag} color="primary" variant="outlined" sx={{ mb: 1 }} />
                        ))
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#e1f5fe', borderLeft: '6px solid #03a9f4', borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <TwitterIcon color="info" />
                      <Typography variant="h6" fontWeight={600} color="#0288d1">Generated Tweets</Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {result.twitter_thread.length === 0 ? (
                        <Typography color="text.secondary">No tweets generated.</Typography>
                      ) : (
                        result.twitter_thread.map((tweet, idx) => (
                          <Card key={idx} sx={{ background: '#f5f5f5', borderLeft: '4px solid #9e9e9e', borderRadius: 1, boxShadow: 1 }}>
                            <CardContent sx={{ py: '12px !important', px: '16px !important' }}>
                              <Typography variant="body2">{tweet}</Typography>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ background: '#f3e5f5', borderLeft: '6px solid #ab47bc', borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" mb={1}>
                      <Typography variant="h6" fontWeight={600} color="#8e24aa">Full Transcript</Typography>
                      <Button size="small" variant="outlined" onClick={() => {navigator.clipboard.writeText(result.transcript.map(t => t.text).join(' '))}} sx={{ color: '#8e24aa', borderColor: '#8e24aa' }}>Copy Transcript</Button>
                    </Stack>
                    <Box sx={{ mt: 1, maxHeight: 300, overflowY: 'auto', background: '#fff', p: 2, borderRadius: 1, fontSize: 14, fontFamily: 'monospace', whiteSpace: 'pre-wrap', boxShadow: 1 }}>
                      {result.transcript.map((line, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#ab47bc', minWidth: 40 }}>
                            {new Date(line.start * 1000).toISOString().substr(14, 5)}
                          </Typography>
                          <Typography variant="body2">{line.text}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
              <TopComments comments={result.top_comments || []} />
            </Box>
            <Box sx={{ mt: 4 }}>
              <FeedbackForm analysisId={result.id} onSubmit={handleFeedbackSubmit} />
            </Box>
          </Box>
        )}

        <Dialog open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)}>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {upgradeReason === 'exhausted_credits'
                ? "You have exhausted your free credits for the month. Please upgrade to the Pro tier for unlimited access."
                : "Upgrade to the Pro tier for unlimited access and advanced features!"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUpgradeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpgrade} variant="contained">Upgrade</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}