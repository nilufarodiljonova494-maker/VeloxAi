export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'chat' | 'image' | 'voice';
  imageUrl?: string;
  audioUrl?: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export type AppMode = 'chat' | 'image' | 'voice';

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Erkak' | 'Ayol';
  description: string;
}
