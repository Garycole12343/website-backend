// src/store/slices/javaScriptSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const CATEGORY = "javascript";

// Load resources from MongoDB
export const fetchJavascriptResources = createAsyncThunk(
  "javascriptBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch JavaScript resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Create a resource in MongoDB
export const createJavascriptResource = createAsyncThunk(
  "javascriptBoard/createResource",
  async ({ title, description = "", link = "", ownerEmail, ownerName = "" }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          link,
          category: CATEGORY,
          ownerEmail,
          ownerName
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to create JavaScript resource");

      return {
        id: data.id,
        title,
        description,
        link,
        category: CATEGORY,
        ownerEmail,
        ownerName,
        likes: 0
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Like a resource in MongoDB
export const likeJavascriptResource = createAsyncThunk(
  "javascriptBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like JavaScript resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  javascriptResources: [],
  status: "idle",
  error: null
};

const javascriptSlice = createSlice({
  name: "javascriptBoard",
  initialState,
  reducers: {
    clearJavascriptResources: (state) => {
      state.javascriptResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchJavascriptResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchJavascriptResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.javascriptResources = action.payload;
      })
      .addCase(fetchJavascriptResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // create
      .addCase(createJavascriptResource.fulfilled, (state, action) => {
        state.javascriptResources.unshift(action.payload);
      })
      .addCase(createJavascriptResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })

      // like
      .addCase(likeJavascriptResource.fulfilled, (state, action) => {
        const r = state.javascriptResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeJavascriptResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearJavascriptResources } = javascriptSlice.actions;
export default javascriptSlice.reducer;
