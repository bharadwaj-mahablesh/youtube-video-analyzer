import React from 'react';
import { Box, Chip, IconButton, Tooltip, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface HashtagsProps {
  hashtags: string[];
}

const Hashtags: React.FC<HashtagsProps> = ({ hashtags }) => {
  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {hashtags.map((tag, idx) => (
          <Chip
            key={idx}
            label={tag}
            sx={{ mb: 1 }}
            onDelete={() => handleCopy(tag)}
            deleteIcon={
              <Tooltip title="Copy hashtag">
                <IconButton size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
            variant="outlined"
            color="primary"
          />
        ))}
      </Stack>
    </Box>
  );
};

export default Hashtags; 