export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id?: number;
  role: Role;
  content: string;
  streaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface ChatProvider {
  name: string;
  generateStream(messages: Message[]): AsyncGenerator<string, void, unknown>;
}

export interface PillarQuote {
  text: string;
  author: string;
}
