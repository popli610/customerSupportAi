"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
  MenuItem,
  Menu,
  TextField,
  Popper,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import SendIcon from "@mui/icons-material/Send";
import Feedback from "./Feedback";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MenuIcon from "@mui/icons-material/Menu";

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


interface Message {
  content: string;
  role: "assistant" | "user";
  options?: string[];
}

import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust the path to your firebaseConfig file
import { TimeSlot } from "../../interfaces/TimeSlot"; // Import your TimeSlot interface

import { doc, updateDoc } from "firebase/firestore";

// Function to fetch available slots
async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  await createSlotsIfNotExist(date);
  console.log("Querying for date:", date); // Log the date being queried
  const slotsQuery = query(
    collection(db, "time_slots"),
    where("date", "==", date),
    where("is_booked", "==", false)
  );

  const querySnapshot = await getDocs(slotsQuery);
  const availableSlots = querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as TimeSlot)
  );

  console.log("Available slots:", availableSlots); // Log the result of the query

  return availableSlots;
}

async function bookSlot(slotId: string) {
  try {
    const slotRef = doc(db, "time_slots", slotId);
    await updateDoc(slotRef, {
      is_booked: true,
    });
  } catch (error) {
    console.error("Error booking slot: ", error);
    throw new Error("Failed to book slot");
  }
}

async function createSlotsIfNotExist(date: string): Promise<void> {
  const slotsQuery = query(
    collection(db, "time_slots"),
    where("date", "==", date)
  );

  const querySnapshot = await getDocs(slotsQuery);

  if (querySnapshot.empty) {
    const slots = generateAllSlotsForDate(date);
    const batch = writeBatch(db); // Create a batch

    slots.forEach((time) => {
      const slotRef = doc(collection(db, "time_slots")); // Create a new doc reference
      batch.set(slotRef, {
        date,
        time,
        is_booked: false,
      });
    });

    await batch.commit(); // Commit the batch
  }
}

function generateAllSlotsForDate(date: string): string[] {
  // Example: generate slots every hour from 9 AM to 5 PM
  return [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];
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

  const [bookingStep, setBookingStep] = useState<number>(0);

  // State for Date and Time pickers
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [restartAnchorEl, setRestartAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const [textAreaDisabled, setTextAreaDisabled] = useState<boolean>(true);


  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);


  const translateMessage = async (text: string, targetLang: string) => {
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
    let messageToSend = newMessage ? newMessage.trim() : messageInput.trim();
    setMessageInput("");
    if (!messageToSend) return;
    if (language !== "en") {
      messageToSend = await translateMessage(messageToSend, language);
    }
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: messageToSend },
      { role: "assistant", content: "" }, // Placeholder for assistant response
    ];
    setMessages(updatedMessages);
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
          let translatedBotResponse = botResponse;
          if (language !== "en") {
            translatedBotResponse = await translateMessage(
              botResponse,
              language
            );
          }
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

  const handleOptionClick = async (option: string) => {
    if (option === "Book an Appointment") {
      setBookingStep(1);
      const translatedMessage = await translateIfNeeded(
        "Please provide your name:"
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: translatedMessage,
        },
      ]);
    } else {
      await sendMessage(option); // Handle other options normally
    }
    setTextAreaDisabled(false);
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

  const translateIfNeeded = async (text: string) => {
    return language !== "en" ? await translateMessage(text, language) : text;
  };
  //  *************boooking process************
  const handleBookingProcess = async (step: number, userInput: string) => {
    let updatedMessages = [...messages];
    setMessageInput("");
    setTextAreaDisabled(true);

    switch (step) {
      case 1:
        updatedMessages.push({ role: "user", content: userInput });
        updatedMessages.push({
          role: "assistant",
          content: await translateIfNeeded(
            "Great! Now, could you please select your preferred date?"
          ),
        });
        setBookingStep(2);
        break;

      case 2:
        if (selectedDate) {
          updatedMessages.push({
            role: "user",
            content: selectedDate.toLocaleDateString(),
          });

          try {
            const availableSlots = await getAvailableSlots(
              selectedDate.toISOString().split("T")[0]
            );
            if (availableSlots.length > 0) {
              setAvailableSlots(availableSlots);
              updatedMessages.push({
                role: "assistant",
                content: await translateIfNeeded(
                  "And what time works best for you? Here are the available slots:"
                ),
              });
              setBookingStep(3);
            } else {
              updatedMessages.push({
                role: "assistant",
                content: await translateIfNeeded(
                  "Sorry, there are no available slots on this date. Please select another date."
                ),
              });
              setBookingStep(2); // Ask for date again
            }
          } catch (error) {
            console.error("Error fetching available slots:", error);
            updatedMessages.push({
              role: "assistant",
              content: await translateIfNeeded(
                "An error occurred while checking available slots. Please try again later."
              ),
            });
            setBookingStep(2); // Ask for date again
          }

          setSelectedDate(null); // Reset date selection
          setTextAreaDisabled(true); // Ensure it's disabled during time selection
        }
        break;

      case 3:
        updatedMessages.push({
          role: "user",
          content: userInput,
        });
        updatedMessages.push({
          role: "assistant",
          content: await translateIfNeeded(
            "Finally, could you provide a brief reason for the appointment?"
          ),
        });
        setBookingStep(4);
        setSelectedTime(null);
        setTextAreaDisabled(false);
        break;

      case 4:
        updatedMessages.push({ role: "user", content: userInput });
        const { name, date, time, reason } =
          extractBookingDetails(updatedMessages);

        try {
          const selectedSlot = availableSlots.find(
            (slot) => slot.time === time
          );
          console.log(availableSlots);
          console.log(time);
          if (selectedSlot) {
            await bookSlot(selectedSlot.id!);
            updatedMessages.push({
              role: "assistant",
              content: await translateIfNeeded(
                "Your appointment has been successfully booked."
              ),
            });
          } else {
            updatedMessages.push({
              role: "assistant",
              content: await translateIfNeeded(
                "Selected slot is no longer available. Please try again."
              ),
            });
          }
        } catch (error) {
          updatedMessages.push({
            role: "assistant",
            content: await translateIfNeeded(
              "An error occurred while booking your appointment. Please try again."
            ),
          });
        }

        setBookingStep(0); // Reset booking step
        setShowFeedback(true);
        setTextAreaDisabled(false); // Re-enable the textarea after the process
        break;

      default:
        break;
    }

    setMessages(updatedMessages);
  };

  const extractBookingDetails = (messages: Message[]) => {
    const name = messages[messages.length - 7]?.content;
    const date = messages[messages.length - 5]?.content;
    const time = messages[messages.length - 3]?.content;
    const reason = messages[messages.length - 1]?.content;

    return { name, date, time, reason };
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      audioRef.current?.play();
      if (bookingStep > 0) {
        handleBookingProcess(bookingStep, messageInput);
      } else {
        sendMessage();
      }
    }
  };

  const timeSlots = ["11:00", "12:00", "13:00", "17:00", "18:00", "19:00"];

  const handleTimeSelection = (time: string) => {
    console.log("Selected Time:", time); // Debugging: Check if time is captured
    setSelectedTime(time); // Update the state
    handleBookingProcess(3, time); // Call the booking process
  };

  //restarting the convo
  const handleRestartConversation = () => {
    setShowFeedback(false);
    setTextAreaDisabled(true);
    setMessages([
      {
        content:
          "Hello! I'm Dr. HeisenBot. How can I assist you with your health today?",
        role: "assistant",
        options: [
          "Book an Appointment",
          "Check Symptoms",
          "Get Medical Information",
          "Contact Support",
        ],
      },
    ]);
    setRestartAnchorEl(null); // Close the menu
  };

  // Function to handle menu opening
  const handleRestartMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRestartAnchorEl(event.currentTarget);
  };

  const handleRestartMenuClose = () => {
    setRestartAnchorEl(null);
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
          <IconButton onClick={toggleLanguageSelect} className="mr-2 ml-2">
            <TranslateIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            // sx={{ mr: 2 }}
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
            } `}
          >
            <div
              className={`inline-block p-3 ${
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
            sx={{ color: "gray ", fontSize: 14, marginTop: "4px" }}
          >
            Language changed to {language.toUpperCase()}
          </Box>
        )}
        {bookingStep === 2 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            color="black"
            my={2}
          >
            <ReactDatePicker
              selected={selectedDate}
              className="bg-blue-50  cursor-pointer p-3 text-gray-800  rounded-lg shadow-lg max-w-sm"
              onChange={(date) => {
                if (date) {
                  setSelectedDate(date); // Update the state first
                }
              }}
              onCalendarClose={() => {
                if (selectedDate) {
                  handleBookingProcess(2, selectedDate.toLocaleDateString()); // Then, call the booking process
                }
              }}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select a date"
              minDate={new Date()} // Disable dates before today
              maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))} // Disable dates after one month from today
            />
          </Box>
        )}

        {bookingStep === 3 && (
          <Grid container spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            {availableSlots.map((slot, idx) => (
              <Grid item xs={6} sm={4} key={idx}>
                <Button
                  variant="contained"
                  onClick={() => handleTimeSelection(slot.time)}
                  sx={{
                    backgroundColor: "#eff6ff", // Blue color for the buttons
                    color: "#000",
                    padding: "8px",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "regular",
                    textTransform: "none",
                    width: "100%",
                    "&:hover": {
                      backgroundColor: "#bfdbfe", // Slightly darker blue on hover
                    },
                  }}
                >
                  {slot.time}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
      <div className="w-full h-[10px] bg-gradient-to-t from-blue-100 to-white"></div>

      <div className="flex border-t border-gray-300 bg-white">
        <IconButton onClick={handleRestartMenuOpen} className="mt-2 ml-2">
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={restartAnchorEl}
          open={Boolean(restartAnchorEl)}
          onClose={handleRestartMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem onClick={handleRestartConversation}>
            Restart Conversation
          </MenuItem>
        </Menu>

        <textarea
          ref={textareaRef}
          value={messageInput}
          onKeyDown={handleKeyPress}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className={`flex-1 h-16 p-4 text-gray-900 border-none outline-none resize-none overflow-y-auto ${
            textAreaDisabled ? "cursor-not-allowed" : ""
          } `}
          style={{ minHeight: "50px", maxHeight: "150px" }}
          disabled={textAreaDisabled}
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