export interface Message {
  text: string;
  source: "left" | "right" | "bot" | "meta";
  from: string;
  time: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  hasNewLeftMessage?: boolean;
  bot_allowed?: boolean; // add this property for AI state
}
