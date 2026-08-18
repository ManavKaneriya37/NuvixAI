import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Sidebar from "../../components/Chats";
import ChatRoom from "../../components/Room";
import {
  addMessage,
  createChat,
  deleteChat,
  fetchChats,
  fetchMessages,
  renameChat,
  setActiveChat,
  setChatTyping,
} from "../../redux/slices/chat.slice";
import { logoutUser } from "../../redux/slices/user.slice";
import { getSocket } from "../../services/socket";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    items,
    activeChatId,
    messagesByChatId,
    typingByChatId,
    status,
    createStatus,
    renamingChatId,
    deletingChatId,
  } = useSelector((state) => state.chat);
  const { user, logoutStatus } = useSelector((state) => state.user);
  const userName = user?.fullname
    ? `${user.fullname.firstname} ${user.fullname.lastname}`.trim()
    : "User";

  useEffect(() => {
    if (status === "idle") dispatch(fetchChats());
  }, [dispatch, status]);

  useEffect(() => {
    if (activeChatId && !messagesByChatId[activeChatId])
      dispatch(fetchMessages(activeChatId));
  }, [activeChatId, dispatch, messagesByChatId]);

  useEffect(() => {
    const socket = getSocket();
    const handleResponse = ({ chat, content }) => {
      dispatch(setChatTyping({ chatId: chat, isTyping: false }));
      dispatch(
        addMessage({
          chatId: chat,
          message: { _id: `response-${Date.now()}`, content, role: "model" },
        }),
      );
    };
    const handleError = ({ chat, message }) => {
      if (chat) dispatch(setChatTyping({ chatId: chat, isTyping: false }));
      toast.error(message || "Unable to send your message.");
    };

    socket.on("ai-response", handleResponse);
    socket.on("ai-error", handleError);
    socket.connect();

    return () => {
      socket.off("ai-response", handleResponse);
      socket.off("ai-error", handleError);
    };
  }, [dispatch]);

  const handleNewChat = (title) => {
    const promise = dispatch(createChat(title)).unwrap();
    toast.promise(promise, {
      loading: "Creating chat...",
      success: "Chat created.",
      error: (error) => error || "Unable to create chat.",
    });
    return promise;
  };

  const handleSendMessage = (content) => {
    if (!activeChatId || !content.trim()) return;

    dispatch(
      addMessage({
        chatId: activeChatId,
        message: {
          _id: `local-${Date.now()}`,
          content: content.trim(),
          role: "user",
        },
      }),
    );

    dispatch(setChatTyping({ chatId: activeChatId, isTyping: true }));

    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit("ai-message", { chat: activeChatId, content: content.trim() });
  };

  const handleDeleteChat = (chatId) => {
    const promise = dispatch(deleteChat(chatId)).unwrap();
    toast.promise(promise, {
      loading: "Deleting chat...",
      success: "Chat deleted.",
      error: (error) => error || "Unable to delete chat.",
    });
    return promise;
  };

  const handleRenameChat = (chatId, title) => {
    const promise = dispatch(renameChat({ chatId, title })).unwrap();
    toast.promise(promise, {
      loading: "Renaming chat...",
      success: "Chat renamed.",
      error: (error) => error || "Unable to rename chat.",
    });
    return promise;
  };

  const handleLogout = () => {
    const promise = dispatch(logoutUser()).unwrap().then(() => {
      getSocket().disconnect();
      navigate("/login", { replace: true });
    });
    toast.promise(promise, {
      loading: "Logging out...",
      success: "Logged out successfully.",
      error: (error) => error || "Unable to log out.",
    });
    return promise;
  };

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[#212121] font-sans text-[#EDEDED]">
      {isSidebarOpen && <button onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/55 md:hidden" aria-label="Close chats" />}
      <Sidebar
        chats={items}
        activeChatId={activeChatId}
        onSelectChat={(chatId) => dispatch(setActiveChat(chatId))}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        isCreating={createStatus === "loading"}
        renamingChatId={renamingChatId}
        deletingChatId={deletingChatId}
        userName={userName}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        isLoggingOut={logoutStatus === "loading"}
      />
      <ChatRoom
        chatId={activeChatId}
        messages={messagesByChatId[activeChatId] || []}
        isTyping={typingByChatId[activeChatId]}
        isLoadingChats={status === "loading"}
        onSendMessage={handleSendMessage}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </div>
  );
};

export default Home;
