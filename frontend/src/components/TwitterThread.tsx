import React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';

interface TwitterThreadProps {
  tweets: string[];
}

const TwitterThread: React.FC<TwitterThreadProps> = ({ tweets }) => (
  <Stack spacing={2} sx={{ mb: 2 }}>
    <Typography variant="h6" gutterBottom>
      Twitter Thread
    </Typography>
    {tweets.map((tweet, idx) => (
      <Card key={idx} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TwitterIcon color="primary" />
            <Typography variant="subtitle2" color="text.secondary">
              Tweet {idx + 1}
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {tweet}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Stack>
);

export default TwitterThread; 