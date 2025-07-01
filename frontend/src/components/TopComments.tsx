import React from 'react';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Comment } from '../api';

interface TopCommentsProps {
  comments: Comment[];
}

const TopComments: React.FC<TopCommentsProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <Card sx={{ background: '#f0f4c3', borderLeft: '6px solid #cddc39', borderRadius: 2, boxShadow: 3, mb: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <ChatBubbleOutlineIcon sx={{ color: '#827717' }} />
          <Typography variant="h6" fontWeight={600} color="#827717">Top Comments</Typography>
        </Stack>
        <Stack spacing={2}>
          {comments.map((comment, index) => (
            <Box key={index} sx={{ p: 1.5, bgcolor: '#f9fbe7', borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="body2" color="text.primary" mb={0.5}>
                {comment.text}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ fontSize: 12, color: 'text.secondary' }}>
                <Typography variant="caption">{comment.author}</Typography>
                {comment.like_count > 0 && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <ThumbUpIcon sx={{ fontSize: 12 }} />
                    <Typography variant="caption">{comment.like_count}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TopComments;
