// src/store/slices/designBoardSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const CATEGORY = "design";

// Load resources from MongoDB
export const fetchDesignResources = createAsyncThunk(
  "designBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch design resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Create a resource in MongoDB
export const createDesignResource = createAsyncThunk(
  "designBoard/createResource",
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
      if (!res.ok) return rejectWithValue(data.message || "Failed to create design resource");

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
export const likeDesignResource = createAsyncThunk(
  "designBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like design resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  designResources: [],
  status: "idle",
  error: null
};

const designBoardSlice = createSlice({
  name: "designBoard",
  initialState,
  reducers: {
    clearDesignResources: (state) => {
      state.designResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchDesignResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDesignResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.designResources = action.payload;
      })
      .addCase(fetchDesignResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // create
      .addCase(createDesignResource.fulfilled, (state, action) => {
        state.designResources.unshift(action.payload);
      })
      .addCase(createDesignResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })

      // like
      .addCase(likeDesignResource.fulfilled, (state, action) => {
        const r = state.designResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeDesignResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearDesignResources } = designBoardSlice.actions;
export default designBoardSlice.reducer;
