"use client";

import { useState } from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ChatBox from "./ChatBox";

const ChatToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        className={`fixed bottom-24 right-4 w-[28rem] h-[36rem] bg-white shadow-lg rounded-lg overflow-hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      >
        {isOpen && <ChatBox onClose={toggleChat} />}
      </div>
      <Fab
        color="primary"
        onClick={toggleChat}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "linear-gradient(135deg, #a855f7, #6366f1)",
          color: "#fff",
          width: 64,
          height: 64,
          borderRadius: "50%",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
          },
        }}
      >
        {isOpen ? (
          <CloseIcon sx={{ fontSize: 32 }} />
        ) : (
          <ChatIcon sx={{ fontSize: 32 }} />
        )}
      </Fab>
    </div>
  );
};

export default ChatToggle;
