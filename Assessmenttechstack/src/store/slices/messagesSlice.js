// src/store/slices/messagesSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Load all conversations for a user
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (email, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/messages?email=${encodeURIComponent(email)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to load conversations");
      return data.conversations || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Create conversation between two emails
export const createConversation = createAsyncThunk(
  "messages/createConversation",
  async ({ participants }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/messages/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to create conversation");
      return data.conversation;
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ conversationId, sender, text }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, sender, text })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to send message");
      return data.conversation;
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  conversations: [],
  status: "idle",
  error: null
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Optimistic updates for UI
    addMessage: (state, action) => {
      const { conversationId, sender, text, timestamp = new Date().toISOString() } = action.payload;
      const convIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (convIndex >= 0) {
        state.conversations[convIndex].messages.push({ sender, text, timestamp });
        // Move to top
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    addConversation: (state, action) => {
      const newConv = action.payload;
      if (!state.conversations.find(c => c.id === newConv.id)) {
        state.conversations.unshift(newConv);
      }
    },
    clearMessages: (state) => {
      state.conversations = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })
      // createConversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const existing = state.conversations.find((c) => c.id === action.payload.id);
        if (!existing) state.conversations.unshift(action.payload);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.payload || "Failed to create conversation";
      })
      // sendMessage
      .addCase(sendMessage.fulfilled, (state, action) => {
        const idx = state.conversations.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) {
          state.conversations[idx] = action.payload;
          // Move to top
          const [conv] = state.conversations.splice(idx, 1);
          state.conversations.unshift(conv);
        } else {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload || "Failed to send message";
      });
  }
});

// Export ALL actions (thunks + reducers) - fixes import errors
export const { addMessage, addConversation, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
