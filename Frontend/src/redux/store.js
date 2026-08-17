import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import chatReducer from "./slices/chat.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
  },
});
