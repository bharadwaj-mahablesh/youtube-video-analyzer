import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface SummaryCardProps {
  summary: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
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