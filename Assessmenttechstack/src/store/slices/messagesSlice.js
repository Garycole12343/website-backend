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
      return {
        conversationId: data.conversationId || conversationId,
        message: data.message,
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// ---- helpers ----
function ensureConvShape(conv) {
  if (!conv) return conv;
  if (!Array.isArray(conv.messages)) conv.messages = [];
  return conv;
}

function messageKey(msg) {
  // prefer server id; fallback to stable composite key
  if (!msg) return "";
  return (
    msg.id ||
    `${(msg.from || "").toLowerCase()}|${(msg.to || "").toLowerCase()}|${msg.text || ""}|${msg.timestamp || ""}`
  );
}

function hasMessage(conv, msg) {
  if (!conv || !msg) return false;
  const key = messageKey(msg);
  if (!key) return false;
  return (conv.messages || []).some((m) => messageKey(m) === key);
}

function upsertMessageAndBump(state, conversationId, message) {
  if (!conversationId || !message) return;

  const idx = state.conversations.findIndex((c) => c.id === conversationId);
  if (idx < 0) return;

  const conv = ensureConvShape(state.conversations[idx]);

  // Prevent duplicates (REST + Socket broadcast)
  if (!hasMessage(conv, message)) {
    conv.messages.push(message);
  }

  conv.updated_at = message.timestamp || new Date().toISOString();

  // Move conversation to top
  state.conversations.splice(idx, 1);
  state.conversations.unshift(conv);
}

const initialState = {
  conversations: [],
  status: "idle",
  error: null,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.conversations = [];
      state.status = "idle";
      state.error = null;
    },

    // Socket events
    addIncomingMessage: (state, action) => {
      const { conversationId, message } = action.payload || {};
      upsertMessageAndBump(state, conversationId, message);
    },

    addConversation: (state, action) => {
      const conv = action.payload;
      if (!conv?.id) return;

      // normalize
      const newConv = ensureConvShape({ ...conv });

      const existingIdx = state.conversations.findIndex((c) => c.id === newConv.id);
      if (existingIdx === -1) {
        state.conversations.unshift(newConv);
      } else {
        // update existing fields without losing messages
        const existing = ensureConvShape(state.conversations[existingIdx]);
        state.conversations[existingIdx] = {
          ...existing,
          ...newConv,
          messages: existing.messages, // keep current messages
        };
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
        state.conversations = (action.payload || []).map((c) => ensureConvShape({ ...c }));
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // createConversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const conv = action.payload;
        if (!conv?.id) return;

        const newConv = ensureConvShape({ ...conv });

        const existing = state.conversations.find((c) => c.id === newConv.id);
        if (!existing) state.conversations.unshift(newConv);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.payload || "Failed to create conversation";
      })

      // sendMessage: update state locally using returned message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload || {};
        upsertMessageAndBump(state, conversationId, message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload || "Failed to send message";
      });
  },
});

export const { clearMessages, addIncomingMessage, addConversation } = messagesSlice.actions;
export default messagesSlice.reducer;
