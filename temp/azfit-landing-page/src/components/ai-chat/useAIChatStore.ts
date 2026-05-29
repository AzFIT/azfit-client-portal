import { create } from 'zustand';
import type { ChatState, ChatMessage } from './types';

const STORAGE_KEY = 'azfit-chat-messages';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore storage errors
  }
}

export const useAIChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: loadMessages(),
  isLoading: false,
  unreadCount: 0,

  toggleOpen: () => {
    const nextOpen = !get().isOpen;
    set({ isOpen: nextOpen });
    if (nextOpen) {
      set({ unreadCount: 0 });
    }
  },

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };
    const messages = [...get().messages, newMessage];
    saveMessages(messages);

    // Only increment unread if chat is closed and it's an assistant message
    const isAssistant = message.role === 'assistant';
    const unreadIncrement = isAssistant && !get().isOpen ? 1 : 0;

    set({
      messages,
      unreadCount: get().unreadCount + unreadIncrement,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => {
    saveMessages([]);
    set({ messages: [], unreadCount: 0 });
  },

  markRead: () => set({ unreadCount: 0 }),
}));
