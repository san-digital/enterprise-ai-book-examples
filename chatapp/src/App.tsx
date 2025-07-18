import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  text: string;
  source: "left" | "right" | "bot" | "meta";
  from: string;
  time: string;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  hasNewLeftMessage?: boolean;
}

interface ChatWindowProps {
  title: string;
  messages: Message[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  showBack?: boolean;
  onBack?: () => void;
  showNewChat?: boolean;
  onNewChat?: () => void;
  side: "left" | "right";
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  title,
  messages,
  input,
  setInput,
  sendMessage,
  showBack,
  onBack,
  showNewChat,
  onNewChat,
  side,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-window">
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}
      >
        {showBack && (
          <button
            className="back-btn"
            onClick={onBack}
            style={{ marginRight: "1rem" }}
          >
            Back
          </button>
        )}
        <h2 style={{ margin: 0 }}>{title}</h2>
        {showNewChat && (
          <button
            className="new-chat-btn"
            onClick={onNewChat}
            style={{ marginLeft: "auto" }}
          >
            New Chat
          </button>
        )}
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          if (msg.source === "meta") {
            return <div>{msg.text}</div>;
          }
          return (
            <div
              key={idx}
              className={`chat-message${
                msg.source !== side ? " chat-message-grey" : ""
              }`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div className="chat-sender-label">{msg.from}</div>
                {msg.text}
              </div>
              <div className="chat-time-label">{msg.time}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

interface ChatTableProps {
  chats: Chat[];
  onSelectChat: (id: string) => void | Promise<void>;
}

const ChatTable: React.FC<ChatTableProps> = ({ chats, onSelectChat }) => (
  <div className="chat-table-window">
    <h2>Chats</h2>
    <table className="chat-table">
      <thead>
        <tr>
          <th>Chat Name</th>
        </tr>
      </thead>
      <tbody>
        {chats.map((chat) => (
          <tr
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            style={{ cursor: "pointer" }}
          >
            <td style={{ position: "relative" }}>
              {chat.name}
              {chat.hasNewLeftMessage && (
                <span className="new-message-dot"></span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

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
        await fetchMessages(chat.id, setChats);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chats]);

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
    <div className="app-container">
      <div className="left-chat-section">
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
      <div className="right-chat-section">
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
          />
        )}
      </div>
    </div>
  );
};

export default App;
