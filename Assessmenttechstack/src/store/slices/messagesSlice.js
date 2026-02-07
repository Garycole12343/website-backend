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
        body: JSON.stringify({ participants }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to create conversation");
      // backend returns { conversation: {...} }
      return data.conversation;
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Send message (matches backend: from/to/text)
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ conversationId, from, to, text }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, from, to, text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to send message");
      // backend returns: { conversationId, message }
      return { conversationId: data.conversationId || conversationId, message: data.message };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  conversations: [],
  status: "idle",
  error: null,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Optional: clear on logout
    clearMessages: (state) => {
      state.conversations = [];
      state.status = "idle";
      state.error = null;
    },

    // For socket events / optimistic UI if you want it
    addIncomingMessage: (state, action) => {
      const { conversationId, message } = action.payload || {};
      if (!conversationId || !message) return;

      const idx = state.conversations.findIndex((c) => c.id === conversationId);
      if (idx >= 0) {
        const conv = state.conversations[idx];
        conv.messages = conv.messages || [];
        conv.messages.push(message);
        conv.updated_at = message.timestamp || new Date().toISOString();

        // Move to top
        state.conversations.splice(idx, 1);
        state.conversations.unshift(conv);
      }
    },

    addConversation: (state, action) => {
      const newConv = action.payload;
      if (!newConv?.id) return;
      if (!state.conversations.find((c) => c.id === newConv.id)) {
        state.conversations.unshift(newConv);
      }
    },
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
        const conv = action.payload;
        if (!conv?.id) return;
        const existing = state.conversations.find((c) => c.id === conv.id);
        if (!existing) state.conversations.unshift(conv);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.payload || "Failed to create conversation";
      })

      // sendMessage: update state locally using returned message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload || {};
        if (!conversationId || !message) return;

        const idx = state.conversations.findIndex((c) => c.id === conversationId);
        if (idx >= 0) {
          const conv = state.conversations[idx];
          conv.messages = conv.messages || [];
          conv.messages.push(message);
          conv.updated_at = message.timestamp || new Date().toISOString();

          // Move to top
          state.conversations.splice(idx, 1);
          state.conversations.unshift(conv);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload || "Failed to send message";
      });
  },
});

export const { clearMessages, addIncomingMessage, addConversation } = messagesSlice.actions;
export default messagesSlice.reducer;
