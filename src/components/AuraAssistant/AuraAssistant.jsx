import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './AuraAssistant.css';

export default function AuraAssistant() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  useEffect(() => {
    const welcomeMessage = "⭐ Hello! I’m Aura Assistant. I can help you explore our products and prices. Ask me anything!";
    setChat([{ sender: "bot", text: welcomeMessage }]);
  }, []);

  const sendMessage = async (msgText) => {
    const currentMessage = msgText || message;
    if (!currentMessage.trim()) return;

    setChat((prev) => [...prev, { sender: "user", text: currentMessage }]);
    setMessage("");

    try {
      const res = await axios.post("https://mern-backend2-production.up.railway.app/aura-assistant/ask", { prompt: currentMessage });

      const botMessages = res.data.message.split('\n').map(line => ({ sender: "bot", text: line }));
      setChat((prev) => [...prev, ...botMessages]);
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong while contacting the AI 😅" },
      ]);
    }
  };

  return (
    <>
      <div className="chat-icon" onClick={() => setOpen(!open)}>💬</div>

      <div className={`chat-container-popup ${open ? "open" : ""}`}>
        <div className="chat-header">
          <div className="title">Aura Assistant</div>
          <button className="close-btn" onClick={() => setOpen(false)}>✖</button>
        </div>

        <div className="chat-box">
          {chat.map((msg, i) => (
            <div key={i} className={`message-row ${msg.sender}`}>
              <div className={`msg-bubble ${msg.text.startsWith('⭐') ? 'highlight' : ''}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} className="suggestion-btn">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="input-area">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question here..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={() => sendMessage()}>Send</button>
        </div>
      </div>
    </>
  );
}
