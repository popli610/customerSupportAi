"use client";

import { useState } from "react";
import { Box, Button, CircularProgress, Grid, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import Feedback from "./Feedback";

interface Message {
  content: string;
  role: "assistant" | "user";
  options?: string[];
}

const ChatBox: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "Hello! I'm Dr. HeisenBot. How can I assist you with your health today?",
      role: "assistant",
      options: [
        "Book an Appointment",
        "Check Symptoms",
        "Get Medical Information",
        "Contact Support",
      ], // Initial options
    },
  ]);

  const [messageInput, setMessageInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const sendMessage = async (newMessage?: string) => {
    if (newMessage) {
      setMessages((messages) => [
        ...messages,
        { role: "user", content: newMessage },
        { role: "assistant", content: "" },
      ]);
    } else {
      const inputMessage = messageInput.trim();
      if (!inputMessage) return;

      setMessageInput("");
      setMessages((messages) => [
        ...messages,
        { role: "user", content: inputMessage },
        { role: "assistant", content: "" },
      ]);
    }

    try {
      setIsLoading(true);
      setShowFeedback(false);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ...messages,
          { role: "user", content: newMessage },
        ]),
      });
      console.log("After fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const readStream = async () => {
        if (!reader) return;
        console.log("Inside readStream");

        let done, value;
        let botResponse = "";
        while ((({ done, value } = await reader.read()), !done)) {
          console.log("Reading stream");
          const text = decoder.decode(value || new Uint8Array(), {
            stream: true,
          });
          botResponse += text;
          setMessages((messages) => {
            const lastMessage = messages[messages.length - 1];
            const otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              {
                ...lastMessage,
                content: botResponse,
              },
            ];
          });
        }
      };
      setIsLoading(false);
      await readStream();
      console.log("read complete");
      setShowFeedback(true);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };
  const handleOptionClick = (option: string) => {
    sendMessage(option); // Send the selected option as a message
  };
  const handleFeedbackSubmit = async (rating: number) => {
    setShowFeedback(false);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="p-5 bg-gradient-to-r from-blue-100 to-white text-gray-900 rounded-t-lg shadow-lg"
      >
        <Box display="flex" alignItems="center">
          <img
            src="/bot-2.png"
            alt="Bot"
            className="w-10 h-10 mr-2 rounded-full"
          />
          <div>
            <div className="font-bold text-lg">Dr. HeisenBot</div>
            {/* <div className="text-sm">How can I help you today?</div> */}
          </div>
        </Box>
        <IconButton onClick={onClose} className="text-green-500">
          <CloseIcon />
        </IconButton>
      </Box>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex items-end ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-green-500 text-white rounded-l-lg rounded-tr-lg shadow-lg"
                  : "bg-blue-50 text-gray-800 rounded-r-lg rounded-tl-lg shadow-lg max-w-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-3 flex items-end justify-start">
            <div className="inline-block p-3 rounded-lg bg-blue-50 text-gray-800 rounded-r-lg rounded-tl-lg shadow-lg max-w-sm">
              <CircularProgress size={20} />
            </div>
          </div>
        )}
        {/* {messages[messages.length - 1]?.options && (
          <div className="mt-4 space-y-2">
            {messages[messages.length - 1].options!.map((option, idx) => (
              <Button
                key={idx}
                variant="contained"
                onClick={() => handleOptionClick(option)}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  width: "1/2",
                  padding: "5px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  "&:hover": {
                    backgroundColor: "#388E3C",
                  },
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        )} */}
        <Grid container spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          {messages[messages.length - 1].options!.map((option, idx) => (
            <Grid item xs={6} sm={6} key={idx}>
              <Button
                variant="contained"
                onClick={() => handleOptionClick(option)}
                sx={{
                  backgroundColor: "#22c55e ",
                  color: "#111827 ",
                  padding: "8px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: "regular",
                  textTransform: "none",
                  width: "100%",
                  "&:hover": {
                    backgroundColor: "#16a34a ",
                  },
                }}
              >
                {option}
              </Button>
            </Grid>
          ))}
        </Grid>
        {showFeedback && <Feedback onSubmit={handleFeedbackSubmit} />}
      </div>
      <div className="flex border-t border-gray-300 bg-white">
        <input
          type="text"
          value={messageInput}
          onKeyPress={handleKeyPress}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 text-black p-4 border-none outline-none"
        />
        <button
          onClick={() => sendMessage()}
          // disabled={!messageInput.trim()}
          className={`p-3 ${
            messageInput.trim()
              ? "bg-green-500 text-white hover:bg-green-600 transition duration-300 ease-in-out"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
