"use client";

import { useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

interface Message {
  content: string;
  role: "assistant" | "user";
}

const ChatBox: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "Hi there 👋! I'm an AI bot. What questions can I answer to help you learn more about ABC.",
      role: "assistant",
    },
  ]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    const newMessage = messageInput.trim();
    if (!newMessage) return;

    setMessageInput("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: newMessage },
      { role: "assistant", content: "" },
    ]);
    console.log("Before try block");
    try {
      setIsLoading(true);
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
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
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
        className="p-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg shadow"
      >
        <Box display="flex" alignItems="center">
          <img
            src="/bot-2.png"
            alt="Bot"
            className="w-10 h-10 mr-2 rounded-full"
          />
          <div>
            <div className="font-bold text-lg">HeisenBot</div>
            {/* <div className="text-sm">How can I help you today?</div> */}
          </div>
        </Box>
        <IconButton onClick={onClose} className="text-white">
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
                  ? "bg-indigo-400 text-white rounded-l-lg rounded-tr-lg shadow-lg"
                  : "bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg shadow-lg max-w-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-3 flex items-end justify-start">
            <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg shadow-lg max-w-sm">
              <CircularProgress size={20} />
            </div>
          </div>
        )}
      </div>
      <div className="flex border-t border-gray-300 bg-white">
        <input
          type="text"
          value={messageInput}
          onKeyPress={handleKeyPress}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 text-black p-3 border-none outline-none"
          />
        <button
          onClick={sendMessage}
          // disabled={!messageInput.trim()}
          className={`p-3 ${
            messageInput.trim()
              ? "bg-indigo-500 text-white hover:bg-indigo-700 transition duration-300 ease-in-out"
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
