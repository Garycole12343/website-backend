// messagesSlice.js - FINAL VERSION:
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [
    {
      id: 1,
      participants: ['You', 'User2'],
      messages: [
        { sender: 'You', text: 'Hello!', timestamp: '10:00 AM' },
        { sender: 'User2', text: 'Hi!', timestamp: '10:01 AM' },
      ],
    },
  ],
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addConversation: (state, action) => {
      state.conversations.push(action.payload);
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const conversationIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].messages = [
          ...state.conversations[conversationIndex].messages,
          message
        ];
      }
    },
  },
});

export const { addConversation, addMessage } = messagesSlice.actions;
export default messagesSlice.reducer; // ONLY ONE DEFAULT EXPORT