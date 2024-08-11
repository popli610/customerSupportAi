"use client";

import { useState, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
  MenuItem,
  Menu,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import SendIcon from "@mui/icons-material/Send";
import Feedback from "./Feedback";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";

import { getServerSession } from "next-auth";

interface Message {
  content: string;
  role: "assistant" | "user";
  options?: string[];
}

const formatDate = () => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  return date.toLocaleDateString("en-US", options);
};

const ChatBox: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  
const session = useSession()
const fullNameFormatted = session?.data?.user?.name?.split(" ").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(" ") || ''


  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        `Hello ${fullNameFormatted} ! I'm Dr. HeisenBot. How can I assist you with your health today?`,
      role: "assistant",
      options: [
        "Book an Appointment",
        "Check Symptoms",
        "Get Medical Information",
        "Contact Support",
      ],
    },
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [messageInput, setMessageInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [language, setLanguage] = useState<string>("en");
  const [showLanguageChangeText, setShowLanguageChangeText] =
    useState<boolean>(false);

  const translateMessage = async (text: string, targetLang: string) => {
    if (targetLang === "en") {
      return text;
    }
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        targetLanguage: targetLang,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Translation error:", data.error);
      return text; // Return the original text in case of an error
    }

    return data.translatedText;
  };

  const sendMessage = async (newMessage?: string) => {
    // Update state with the user message
    audioRef.current?.play();
    let updatedMessages = messages;
    let translatedMessage = newMessage || messageInput;
    if (newMessage) {
      translatedMessage = await translateMessage(newMessage, language);
      updatedMessages = [
        ...messages,
        { role: "user", content: translatedMessage },
        { role: "assistant", content: "" }, // Prepare placeholder for assistant response
      ];
    } else {
      translatedMessage = await translateMessage(messageInput.trim(), language);
      if (!translatedMessage) return;

      setMessageInput(""); // Clear the input field
      updatedMessages = [
        ...messages,
        { role: "user", content: translatedMessage },
        { role: "assistant", content: "" }, // Prepare placeholder for assistant response
      ];
    }

    setMessages(updatedMessages); // Update the state

    setIsLoading(true);
    setShowFeedback(false);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMessages), // Send the updated message array
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let botResponse = "";
        let done = false;
        setIsLoading(false);
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          const chunk = decoder.decode(value, { stream: true });
          botResponse += chunk;

          const translatedBotResponse = await translateMessage(
            botResponse,
            language
          );

          // Update the assistant's response in the state
          setMessages((prevMessages) => {
            const lastMessageIndex = prevMessages.length - 1;
            const updatedAssistantMessage = {
              ...prevMessages[lastMessageIndex],
              content: translatedBotResponse,
            };

            return [
              ...prevMessages.slice(0, lastMessageIndex),
              updatedAssistantMessage,
            ];
          });
        }
        setShowFeedback(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const toggleLanguageSelect = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    setShowLanguageChangeText(true);
    handleMenuClose();
    setTimeout(() => {
      setShowLanguageChangeText(false);
    }, 2000);
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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <audio ref={audioRef} src="/notification-2.mp3" />
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

        <Box display="flex" alignItems="center">
          <IconButton onClick={toggleLanguageSelect}>
            <TranslateIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            sx={{ mr: 2 }}
          >
            <MenuItem onClick={() => handleLanguageChange("en")}>
              English
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange("hi")}>
              Hindi
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange("es")}>
              Spanish
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange("de")}>
              German
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography variant="body2" className="text-gray-500">
            {formatDate()}
          </Typography>
        </Box>
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
              {/* {msg.content} */}
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
        <Grid container spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          {messages[messages.length - 1].options?.map((option, idx) => (
            <Grid item xs={6} sm={6} key={idx}>
              <Button
                variant="contained"
                onClick={() => handleOptionClick(option)}
                sx={{
                  backgroundColor: "#22c55e ",
                  color: "#fff ",
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
        {showLanguageChangeText && (
          <Box
            display="flex"
            justifyContent="center"
            sx={{ color: "gray ", fontSize: 14, marginTop:"4px" }}
          >
            Language changed to {language.toUpperCase()}
          </Box>
        )}
      </div>
      <div className="w-full h-[10px] bg-gradient-to-t from-blue-100 to-white"></div>
      <div className="flex border-t border-gray-300 bg-white">
        <textarea
          ref={textareaRef}
          value={messageInput}
          onKeyDown={handleKeyPress}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 text-gray-900 border-none outline-none resize-none overflow-y-auto"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!messageInput.trim()}
          className={`p-3 rounded-full h-12 w-12 mt-2 mr-2 pt-1 ${
            messageInput.trim()
              ? "bg-transparent text-green-500 hover:bg-gray-300 transition duration-300 ease-in-out"
              : "bg-transparent text-gray-300 cursor-not-allowed"
          }`}
        >
          <SendIcon
            sx={{
              fontSize: 28, // Size of the icon to match the image
              transform: "rotate(-40deg)", // Optional: add a slight rotation if you want the icon to tilt
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
