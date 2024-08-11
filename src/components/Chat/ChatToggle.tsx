"use client";

import { useState } from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ChatBox from "./ChatBox";
import TextsmsIcon from "@mui/icons-material/Textsms";
import { useSession } from "next-auth/react";


const ChatToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const session = useSession()
  const fullNameFormatted = session?.data?.user?.name?.split(" ").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(" ") || ''

  return (
    
    <div>
      <div
        className={`fixed bottom-24 right-4 w-[28rem] h-[36rem] bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-200 ease-in-out ${isOpen
            ? "translate-y-0 opacity-100 z-10"
            : "translate-y-full opacity-0 z-0"
          }`}
      >
        {isOpen && <ChatBox onClose={toggleChat} />}
      </div>
      {session.data && <Fab
        color="primary"
        onClick={toggleChat}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "linear-gradient(135deg, #4CAF50, #81C784)",
          color: "#fff",
          width: 64,
          height: 64,
          borderRadius: "50%",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transform: "scale(1)",
          "&:hover": {
            transform: "scale(1.05)",
            // background: "linear-gradient(135deg, #388E3C, #66BB6A)",
          },
        }}
      >
        {/* Chat Icon */}
        <div
          className={`transform transition-transform duration-300 ease-in-out ${isOpen ? "rotate-[90deg] opacity-0" : "rotate-0 opacity-100"
            }`}
          style={{
            position: "absolute",
            visibility: isOpen ? "hidden" : "visible",
          }}
        >
          <ChatIcon sx={{ fontSize: 32 }} />
        </div>

        {/* Close Icon */}
        <div
          className={`transform transition-transform duration-300 ease-in-out ${isOpen ? "rotate-0 opacity-100" : "-rotate-[90deg] opacity-0"
            }`}
          style={{
            position: "absolute",
            visibility: isOpen ? "visible" : "hidden",
          }}
        >
          <CloseIcon sx={{ fontSize: 32 }} />
        </div>
      </Fab>
      }
    </div>
  );
};

export default ChatToggle;
