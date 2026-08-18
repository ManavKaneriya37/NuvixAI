import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  items: [],
  activeChatId: null,
  messagesByChatId: {},
  typingByChatId: {},
  status: "idle",
  createStatus: "idle",
  renamingChatId: null,
  deletingChatId: null,
  messagesStatus: "idle",
  error: null,
};

export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat");
      return data.chats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load chats.",
      );
    }
  },
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async (title, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/chat/create", { title });
      return data.chat;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create chat.",
      );
    }
  },
);

export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await api.delete(`/chat/${chatId}`);
      return chatId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to delete chat.",
      );
    }
  },
);

export const renameChat = createAsyncThunk(
  "chat/renameChat",
  async ({ chatId, title }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/chat/${chatId}`, { title });
      return data.chat;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to rename chat.",
      );
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/chat/${chatId}/messages`);
      return { chatId, messages: data.messages };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load messages.",
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      state.messagesByChatId[chatId] ??= [];
      state.messagesByChatId[chatId].push(message);
    },
    setChatTyping: (state, action) => {
      const { chatId, isTyping } = action.payload;
      state.typingByChatId[chatId] = isTyping;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        if (!state.activeChatId && action.payload.length) {
          state.activeChatId = action.payload[0]._id;
        }
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createChat.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload);
        state.messagesByChatId[action.payload._id] = [];
        state.activeChatId = action.payload._id;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })
      .addCase(renameChat.pending, (state, action) => {
        state.renamingChatId = action.meta.arg.chatId;
      })
      .addCase(renameChat.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (chat) => chat._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
        state.renamingChatId = null;
      })
      .addCase(renameChat.rejected, (state, action) => {
        state.renamingChatId = null;
        state.error = action.payload;
      })
      .addCase(deleteChat.pending, (state, action) => {
        state.deletingChatId = action.meta.arg;
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        const deletedChatId = action.payload;
        state.items = state.items.filter((chat) => chat._id !== deletedChatId);
        delete state.messagesByChatId[deletedChatId];
        delete state.typingByChatId[deletedChatId];
        state.deletingChatId = null;

        if (state.activeChatId === deletedChatId) {
          state.activeChatId = state.items[0]?._id || null;
        }
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.deletingChatId = null;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesStatus = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesStatus = "succeeded";
        state.messagesByChatId[action.payload.chatId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { addMessage, setActiveChat, setChatTyping } = chatSlice.actions;
export default chatSlice.reducer;
