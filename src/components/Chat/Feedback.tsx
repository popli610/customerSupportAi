import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";

interface FeedbackProps {
  onSubmit: (rating: number) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ onSubmit }) => {
  const handleFeedback = (rating: number) => {
    onSubmit(rating);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={2}>
      <Typography variant="h6">Did this answer your question?</Typography>
      <Box display="flex" justifyContent="center" mt={2}>
        <IconButton
          onClick={() => handleFeedback(1)}
          aria-label="very dissatisfied"
        >
          <SentimentVeryDissatisfiedIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => handleFeedback(2)} aria-label="neutral">
          <SentimentNeutralIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={() => handleFeedback(3)}
          aria-label="very satisfied"
        >
          <SentimentVerySatisfiedIcon fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Feedback;
