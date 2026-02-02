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
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
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

      // create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const existing = state.conversations.find((c) => c.id === action.payload.id);
        if (!existing) state.conversations.unshift(action.payload);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.payload || "Failed to create conversation";
      })

      // send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const idx = state.conversations.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) {
          state.conversations[idx] = action.payload;
          // move to top
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

export default messagesSlice.reducer;
