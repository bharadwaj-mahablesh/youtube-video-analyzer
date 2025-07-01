import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Rating } from '@mui/material';

interface FeedbackFormProps {
  analysisId: string;
  onSubmit: (analysisId: string, rating: number, comment: string) => void;
  loading?: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ analysisId, onSubmit, loading }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating) {
      onSubmit(analysisId, rating, comment);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" color="text.primary">Rate this Analysis</Typography>
      <Rating
        name="feedback-rating"
        value={rating}
        onChange={(event, newValue) => {
          setRating(newValue);
        }}
      />
      <TextField
        label="Comments (optional)"
        variant="outlined"
        fullWidth
        multiline
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mt: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={!rating || loading}>
        Submit Feedback
      </Button>
    </Box>
  );
};

export default FeedbackForm;
