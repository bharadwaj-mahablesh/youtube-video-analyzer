import React from 'react';
import { Card, CardContent, Typography, Box, Link } from '@mui/material';

interface SummaryCardProps {
  title?: string;
  channel?: string;
  thumbnail?: string;
  summary: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, channel, thumbnail, summary }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img src={thumbnail} alt={title} style={{ width: 120, height: 90, marginRight: 16, borderRadius: 4 }} />
            <Box>
                <Typography variant="h6">{title}</Typography>
                <Link href={`https://www.youtube.com/channel/${channel}`} target="_blank" rel="noopener">
                    <Typography variant="body2">{channel}</Typography>
                </Link>
            </Box>
        </Box>
      <Typography variant="h6" gutterBottom>
        Video Summary
      </Typography>
      <Typography variant="body1">
        {summary}
      </Typography>
    </CardContent>
  </Card>
);

export default SummaryCard;
 