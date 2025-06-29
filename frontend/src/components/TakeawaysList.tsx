import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TakeawaysListProps {
  takeaways: string[];
}

const TakeawaysList: React.FC<TakeawaysListProps> = ({ takeaways }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Key Takeaways
      </Typography>
      <List>
        {takeaways.map((item, idx) => (
          <ListItem key={idx}>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default TakeawaysList; 