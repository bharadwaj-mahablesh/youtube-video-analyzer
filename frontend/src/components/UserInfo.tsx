import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface UserInfoProps {
  tier: string;
  credits: number;
}

const UserInfo: React.FC<UserInfoProps> = ({ tier, credits }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Chip label={`Tier: ${tier.charAt(0).toUpperCase() + tier.slice(1)}`} color="primary" />
      <Typography variant="body1">Credits Remaining: {credits}</Typography>
    </Box>
  );
};

export default UserInfo;