import { Chat } from "../models";

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
        {chats.map((chat) => {
          // Dot color logic
          let dotColor = "#44cc44"; // green by default (no new message)
          if (chat.hasNewLeftMessage) dotColor = "#ff3b3b"; // red if new message
          if (chat.bot_allowed === true) dotColor = "#2286ff"; // blue if AI enabled
          return (
            <tr
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              style={{ cursor: "pointer" }}
            >
              <td style={{ position: "relative" }}>
                {chat.name}
                <span
                  className="new-message-dot"
                  style={{ background: dotColor }}
                ></span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default ChatTable;
