import React, { useState } from 'react';
import { Box, Button, TextField, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface InputFormProps {
  onSubmit: (url: string, provider: string, apiKey?: string) => void;
  loading?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<'ollama' | 'openai'>('ollama');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [error, setError] = useState('');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

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
    if (provider === 'openai' && !openaiApiKey) {
      setError('Please enter your OpenAI API key');
      setApiKeyDialogOpen(true);
      return;
    }
    setError('');
    onSubmit(url, provider, provider === 'openai' ? openaiApiKey : undefined);
  };

  const handleProviderChange = (_: any, val: 'ollama' | 'openai') => {
    if (val) setProvider(val);
    if (val === 'openai' && !openaiApiKey) setApiKeyDialogOpen(true);
  };

  return (
    <>
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
        <ToggleButtonGroup
          value={provider}
          exclusive
          onChange={handleProviderChange}
          size="small"
          sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
          disabled={loading}
        >
          <ToggleButton value="ollama">Ollama (Local)</ToggleButton>
          <ToggleButton value="openai">OpenAI (Cloud)</ToggleButton>
        </ToggleButtonGroup>
        {provider === 'openai' && (
          <Button
            variant={openaiApiKey ? 'outlined' : 'contained'}
            color={openaiApiKey ? 'success' : 'primary'}
            onClick={() => setApiKeyDialogOpen(true)}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {openaiApiKey ? 'API Key Set' : 'Set API Key'}
          </Button>
        )}
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          Analyze
        </Button>
      </Box>
      <Dialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)}>
        <DialogTitle>Enter OpenAI API Key</DialogTitle>
        <DialogContent>
          <TextField
            label="OpenAI API Key"
            variant="outlined"
            value={openaiApiKey}
            onChange={e => setOpenaiApiKey(e.target.value)}
            type={showApiKey ? 'text' : 'password'}
            fullWidth
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle API key visibility"
                    onClick={() => setShowApiKey(s => !s)}
                    edge="end"
                  >
                    {showApiKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setApiKeyDialogOpen(false)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InputForm; 