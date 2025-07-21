import { useEffect, useRef } from "react";
import { Message } from "../models";

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
  aiEnabled?: boolean;
  toggleAi?: () => void;
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
  aiEnabled,
  toggleAi,
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
      {/* Toolbar for right chat window */}
      {side === "right" && (
        <div
          className="chat-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5rem",
            gap: "1rem",
          }}
        >
          <span>
            AI:{" "}
            <b style={{ color: aiEnabled ? "green" : "red" }}>
              {aiEnabled ? "On" : "Off"}
            </b>
          </span>
          <button onClick={toggleAi} style={{ padding: "0.3rem 0.8rem" }}>
            {aiEnabled ? "Disable AI" : "Enable AI"}
          </button>
        </div>
      )}
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
                <div className="chat-sender-label">
                  {side == "right" && msg.source === "left"
                    ? "Customer"
                    : msg.from}
                </div>
                {msg.source === "bot" && side === "right" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="svg-square">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#000000"
                        width="18px"
                        height="18px"
                        viewBox="0 0 56 56"
                      >
                        <path d="M 9.6133 28.6445 L 23.2070 28.6445 C 23.8164 28.8320 24.4258 29.0195 25.1055 29.1602 L 29.4414 30.1914 C 34.2929 31.3633 36.3320 32.9570 36.3320 35.7695 C 36.3320 39.1445 32.8867 41.5586 27.9883 41.5586 C 23.6524 41.5586 20.4180 39.6133 19.1992 36.2851 C 18.7773 35.2773 18.2617 34.8320 17.2773 34.8320 C 16.0351 34.8320 15.2617 35.6055 15.2617 36.8242 C 15.2617 37.2461 15.3086 37.6914 15.4258 38.1367 C 16.6680 42.5664 21.5664 45.3320 28.0117 45.3320 C 35.7695 45.3320 40.7617 41.3711 40.7617 35.2539 C 40.7617 32.3242 39.6836 30.2148 37.3164 28.6445 L 46.3867 28.6445 C 46.9258 28.6445 47.3476 28.2226 47.3476 27.6836 C 47.3476 27.1445 46.9258 26.7226 46.3867 26.7226 L 32.9336 26.7226 C 32.2773 26.5117 31.5976 26.3242 30.8476 26.1602 L 27.0273 25.2461 C 22.2695 24.0977 20.2539 22.6445 20.2539 20.0429 C 20.2539 16.7617 23.4883 14.4414 27.9648 14.4414 C 31.9961 14.4414 34.8789 16.2695 36.0273 19.5039 C 36.4258 20.3945 36.9648 20.8164 37.9024 20.8164 C 39.1211 20.8164 39.8711 20.1133 39.8711 18.9414 C 39.8711 18.5898 39.8242 18.2148 39.7305 17.8633 C 38.6758 13.5977 33.9883 10.6680 27.9648 10.6680 C 20.9102 10.6680 15.8242 14.6758 15.8242 20.3477 C 15.8242 23.1133 16.8555 25.1758 19.0586 26.7226 L 9.6133 26.7226 C 9.0742 26.7226 8.6524 27.1445 8.6524 27.6836 C 8.6524 28.2226 9.0742 28.6445 9.6133 28.6445 Z" />
                      </svg>
                    </span>
                    <span className="svg-square">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18px"
                        height="18px"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                )}
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

export default ChatWindow;
