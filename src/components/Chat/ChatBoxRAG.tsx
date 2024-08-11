"use client";

import {
  Box,
  Typography,

} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "ai/react"



const ChatBoxRAG: React.FC<{}> = () => {

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: 'api/symptoms',
  onError: (e) => {
    console.log(e)
  }
})


const formatDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("en-US", options);
  };


  return (
    <div className="absolute bottom-4 left-4 flex flex-col max-h-[40vw] w-[448px]">
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
       
      </div>
      <div className="w-full h-[10px] bg-gradient-to-t from-blue-100 to-white"></div>
      <div className="flex border-t border-gray-300 bg-white">
        <textarea
        
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-3 text-gray-900 border-none outline-none resize-none overflow-y-auto"
        />
        <button
          onClick={handleSubmit}
          className={`p-3 rounded-full h-12 w-12 mt-2 mr-2 pt-1 ${
            input.trim()
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

export default ChatBoxRAG;
