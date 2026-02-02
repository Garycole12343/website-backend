// src/store/slices/cookingBoardSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const CATEGORY = "cooking";

export const fetchCookingResources = createAsyncThunk(
  "cookingBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch cooking resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

export const createCookingResource = createAsyncThunk(
  "cookingBoard/createResource",
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
      if (!res.ok) return rejectWithValue(data.message || "Failed to create cooking resource");

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

export const likeCookingResource = createAsyncThunk(
  "cookingBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like cooking resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  cookingResources: [],
  status: "idle",
  error: null
};

const cookingBoardSlice = createSlice({
  name: "cookingBoard",
  initialState,
  reducers: {
    clearCookingResources: (state) => {
      state.cookingResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCookingResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCookingResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cookingResources = action.payload;
      })
      .addCase(fetchCookingResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })
      .addCase(createCookingResource.fulfilled, (state, action) => {
        state.cookingResources.unshift(action.payload);
      })
      .addCase(createCookingResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })
      .addCase(likeCookingResource.fulfilled, (state, action) => {
        const r = state.cookingResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeCookingResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearCookingResources } = cookingBoardSlice.actions;
export default cookingBoardSlice.reducer;
