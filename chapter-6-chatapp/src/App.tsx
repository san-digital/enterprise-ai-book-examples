import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import ChatWindow from "./components/ChatWindow";
import { Chat } from "./models";
import ChatTable from "./components/ChatTable";

const BACKEND_URL = "http://localhost:5000";

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [leftChatId, setLeftChatId] = useState<string | null>(null);
  const [rightChatId, setRightChatId] = useState<string | null>(null);
  const [leftInput, setLeftInput] = useState<string>("");
  const [rightInput, setRightInput] = useState<string>("");

  // Fetch chats from backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/chats`)
      .then((res) => res.json())
      .then((data) => setChats(data));
  }, []);

  // Poll messages for all chats every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const chat of chats) {
        fetchMessages(chat.id, setChats);
        fetchAiEnabled(chat.id);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chats]);

  const fetchAiEnabled = async (chatId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/chats/${chatId}/ai`);
      if (res.ok) {
        const data = await res.json();
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, bot_allowed: data.bot_allowed }
              : chat
          )
        );
      }
    } catch (e) {
      // Optionally handle error
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (
    chatId: string,
    setter: React.Dispatch<React.SetStateAction<Chat[]>>
  ) => {
    const res = await fetch(`${BACKEND_URL}/chats/${chatId}/messages`);
    const messages = await res.json();
    setter((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, messages } : chat))
    );
  };

  // Create new chat
  const handleNewChat = async () => {
    const now = new Date();
    const name = now.toLocaleString();
    const res = await fetch(`${BACKEND_URL}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const chat = await res.json();
    setChats((prev) => [...prev, { ...chat, messages: [] }]);
    setLeftChatId(chat.id);
    setLeftInput("");
  };

  // Select chat for right
  const handleSelectChatRight = async (id: string) => {
    setRightChatId(id);
    setRightInput("");
    await fetchMessages(id, setChats);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, hasNewLeftMessage: false } : chat
      )
    );
  };
  // Back for right only
  const handleBack = () => {
    setRightChatId(null);
    setRightInput("");
  };

  // Toggle AI state for right chat
  const toggleAi = async () => {
    if (!rightChatId) return;
    const chat = chats.find((c) => c.id === rightChatId);
    const newEnabled = !chat?.bot_allowed;
    try {
      const res = await fetch(`${BACKEND_URL}/chats/${rightChatId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === rightChatId
              ? { ...chat, bot_allowed: data.bot_allowed }
              : chat
          )
        );
      }
    } catch (e) {
      // Optionally handle error
    }
  };

  // Send message from left window
  const sendLeftMessage = async () => {
    if (leftInput.trim() && leftChatId) {
      await fetch(`${BACKEND_URL}/chats/${leftChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: leftInput, source: "left", from: "You" }),
      });
      await fetchMessages(leftChatId, setChats);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === leftChatId ? { ...chat, hasNewLeftMessage: true } : chat
        )
      );
      setLeftInput("");
    }
  };

  // Send message from right window
  const sendRightMessage = async () => {
    if (rightInput.trim() && rightChatId) {
      await fetch(`${BACKEND_URL}/chats/${rightChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: rightInput,
          source: "right",
          from: "Customer Agent (Niall)",
        }),
      });
      await fetchMessages(rightChatId, setChats);
      setRightInput("");
    }
  };

  const leftChat = chats.find((chat) => chat.id === leftChatId);
  const rightChat = chats.find((chat) => chat.id === rightChatId);

  const leftMessages = leftChat ? leftChat.messages : [];
  const rightMessages = rightChat ? rightChat.messages : [];

  return (
    <div
      className="app-container"
      style={{ display: "flex", justifyContent: "center", gap: 0 }}
    >
      <div className="left-chat-section">
        <h2
          style={{
            textAlign: "center",
            color: "#228866",
            marginBottom: "0.5rem",
          }}
        >
          Customer
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <button className="new-chat-btn" onClick={handleNewChat}>
            New Chat
          </button>
        </div>
        {leftChatId === null ? (
          <div>Please create a new chat</div>
        ) : (
          <ChatWindow
            title={leftChat?.name || ""}
            messages={leftMessages}
            input={leftInput}
            setInput={setLeftInput}
            sendMessage={sendLeftMessage}
            side="left"
          />
        )}
      </div>
      <div
        style={{
          width: "2px",
          background: "#fff",
          margin: "0 2rem",
          minHeight: "600px",
          alignSelf: "stretch",
          borderRadius: "2px",
          boxShadow: "0 0 4px #eee",
        }}
      ></div>
      <div className="right-chat-section">
        <h2
          style={{
            textAlign: "center",
            color: "#228866",
            marginBottom: "0.5rem",
          }}
        >
          Support Team
        </h2>
        {rightChatId === null ? (
          <ChatTable chats={chats} onSelectChat={handleSelectChatRight} />
        ) : (
          <ChatWindow
            title={rightChat?.name || ""}
            messages={rightMessages}
            input={rightInput}
            setInput={setRightInput}
            sendMessage={sendRightMessage}
            showBack={true}
            onBack={handleBack}
            side="right"
            aiEnabled={rightChat?.bot_allowed}
            toggleAi={toggleAi}
          />
        )}
      </div>
    </div>
  );
};

export default App;
