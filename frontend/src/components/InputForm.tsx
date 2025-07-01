import React, { useState } from 'react';
import { Box, Button, TextField, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface InputFormProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (value: string) => {
    // Simple YouTube URL validation
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    setError('');
    onSubmit(url);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
      <TextField
        label="YouTube Video URL"
        variant="outlined"
        value={url}
        onChange={e => setUrl(e.target.value)}
        error={!!error}
        helperText={error}
        fullWidth
        disabled={loading}
      />
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        Analyze
      </Button>
    </Box>
  );
};

export default InputForm; 