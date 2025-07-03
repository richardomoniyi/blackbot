import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, MessageCircle, Send } from "lucide-react";
//import { getToken } from "../api/apicall";

type Message = {
  role: "user" | "system" | "assistant";
  content: string;
};

interface ChatbotProps {
  isOpen?: boolean; // Optional prop
}

const generateReference = () => {
  // YYMMddHHmmss + 6 random digits
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr =
    now.getFullYear().toString().slice(2) +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${dateStr}${rand}`;
};

const Chatbot: React.FC<ChatbotProps> = ({ isOpen: initialIsOpen = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(initialIsOpen); // Use the prop value as the initial state
  const apiUrl = import.meta.env.VITE_CHATBOT_URL; // Replace with your API URL
  const token = import.meta.env.VITE_CHATBOT_TOKEN;
  const referenceRef = useRef<string>(generateReference());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(false);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setSessionEnded(true);
      referenceRef.current = generateReference(); // Regenerate reference
    }, 5 * 60 * 1000); // 5 minutes
  };

  /* useEffect(() => {
    if (isOpen) {
      setMessages([{ role: "user", content: "Hey" }]);
    }
  }, [isOpen]);
*/
  // Inside your Chatbot component
  useEffect(() => {
    if (isOpen) setMessages([{ role: "user", content: "..." }]);
    if (isOpen && !sessionEnded) {
      resetInactivityTimer();
    }
    // Clean up on unmount
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isOpen, sessionEnded]);
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true); // Show spinner

    try {
      const payload = {
        reference: referenceRef.current,
        message: input,
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from your environment variable
        },
      });
      const botMessage: Message = {
        role: "system",
        content: (response.data as { reply: string }).reply,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Oops! Something went wrong while connecting to the assistant. Please try again soon.",
        },
      ]);
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-0 right-0 m-4">
      <button
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>
      {isOpen && (
        <div className="w-80 h-116 border border-gray-300 rounded-lg flex flex-col p-2 bg-white shadow-lg fixed bottom-16 right-4">
          <div className="flex justify-between items-center p-2 border-b">
            <span className="font-semibold">Chat Support</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[80%] flex items-center gap-2 ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white text-left self-end ml-auto"
                      : "bg-gray-200 text-black text-left self-start mr-auto"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {/* Warning card inside the chat area */}
            {sessionEnded && (
              <div
                className="session-ended-card"
                style={{
                  background: "#fff3cd",
                  color: "#856404",
                  padding: 16,
                  borderRadius: 8,
                  margin: "16px auto",
                  border: "1px solid #ffeeba",
                  maxWidth: "80%",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0" }}>Session Ended</h3>
                <p style={{ margin: 0 }}>
                  Your session has ended due to inactivity.
                </p>
                <button
                  onClick={() => {
                    setSessionEnded(false);
                    setMessages([
                      {
                        role: "system",
                        content:
                          "Welcome, My name is Chika, How can I assist you today?",
                      },
                    ]);
                    resetInactivityTimer();
                  }}
                  style={{
                    background: "#ffeeba",
                    color: "#856404",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    marginTop: 5,
                    cursor: "pointer",
                  }}
                >
                  Start New Session
                </button>
              </div>
            )}
            {loading && (
              <div
                className="flex items-center justify-start"
                style={{ margin: "8px 0" }}
              >
                <div
                  className="p-2 rounded-lg bg-gray-200 text-black"
                  style={{ fontStyle: "italic", opacity: 0.7 }}
                >
                  ...
                </div>
              </div>
            )}
            {/* This div is used as the scroll target */}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex p-2 border-t">
            <input
              className="flex-1 p-2 border rounded-l-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <button
              className="bg-blue-500 text-white px-4 rounded-r-lg flex items-center justify-center"
              onClick={sendMessage}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
