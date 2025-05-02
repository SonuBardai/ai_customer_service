import React, { useState } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import { getContrastColor } from "../utils/color";

interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  message: string;
  timestamp: string;
}

interface ChatbotInterfaceProps {
  botName: string;
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string;
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ botName, primaryColor = "#4F46E5", secondaryColor = "#10B981", logo }) => {
  // Dummy chat data
  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      message: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: "10:00 AM",
    },
    {
      id: 2,
      sender: "user",
      message: "I need help with my account",
      timestamp: "10:01 AM",
    },
    {
      id: 3,
      sender: "bot",
      message: "I'd be happy to help you with your account. What specific issue are you facing?",
      timestamp: "10:01 AM",
    },
  ]);

  return (
    <div className="card w-[400px] h-[500px] backdrop-blur-lg glass shadow-xl">
      <div className="card-body p-4">
        <div className="flex items-center gap-2 mb-2">
          {logo ? <img src={logo} alt="Bot logo" className="w-6 h-6 rounded-full" /> : <FaRobot className="text-xl" />}
          <h2 className="card-title text-lg text-white">{botName}</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}>
              <div className="chat-image avatar">
                <div className="w-6 rounded-full">{msg.sender === "user" ? <FaUser className="w-full h-full p-1" /> : <FaRobot className="w-full h-full p-1" />}</div>
              </div>
              <div
                className={`chat-bubble ${msg.sender === "user" ? "bg-primary text-primary-content" : "bg-secondary text-secondary-content"}`}
                style={{
                  backgroundColor: msg.sender === "user" ? primaryColor : secondaryColor,
                  color: msg.sender === "user" ? getContrastColor(primaryColor) : getContrastColor(secondaryColor),
                }}
              >
                {msg.message}
                <div className="text-xs opacity-80 mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-actions justify-end mt-2">
          <input type="text" placeholder="Type your message..." className="input input-bordered input-sm w-full bg-white/20 border-white/30 text-white placeholder:text-white/50" />
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: primaryColor,
              color: getContrastColor(primaryColor),
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;
