import { Box, IconButton, Typography } from "@mui/material";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { useState } from "react";

const Feedback: React.FC<{ onSubmit: (rating: number) => void }> = ({
  onSubmit,
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);

  const handleClick = (rating: number) => {
    setFeedbackGiven(true);
    // onSubmit(rating);
  };

  return (
    <Box display="flex" justifyContent="flex-start">
      {feedbackGiven ? (
        <Typography variant="body2" sx={{ color: "gray" }}>
          Thanks for your feedback!
        </Typography>
      ) : (
        <>
          <IconButton
            onClick={() => handleClick(3)}
            sx={{
              "&:hover": {
                color: "green",
              },
            }}
          >
            <SentimentVerySatisfiedIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleClick(2)}
            sx={{
              "&:hover": {
                color: "orange",
              },
            }}
          >
            <SentimentSatisfiedIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleClick(1)}
            sx={{
              "&:hover": {
                color: "red",
              },
            }}
          >
            <SentimentDissatisfiedIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default Feedback;
