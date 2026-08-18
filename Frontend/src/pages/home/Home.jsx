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
    const promise = dispatch(logoutUser())
      .unwrap()
      .then(() => {
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
      {isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/55 md:hidden"
          aria-label="Close chats"
        />
      )}
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

      {/* Show chat room only if a chat is selected */}
      {activeChatId ? (
        <ChatRoom
          chatId={activeChatId}
          messages={messagesByChatId[activeChatId] || []}
          isTyping={typingByChatId[activeChatId]}
          isLoadingChats={status === "loading"}
          onSendMessage={handleSendMessage}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      ) : (
        /* Empty state when no chat is selected */
        <main className="min-w-0 flex-1 flex flex-col h-full bg-gradient-to-b from-[#212121] to-[#1a1a1a]">
          {/* Header with Mobile Menu Button */}
          <div className="h-14 flex flex-shrink-0 items-center px-3 sm:px-4 border-b border-[#2B2B2B]/50">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded p-1 text-[#888888] hover:bg-white/5 hover:text-white transition-colors md:hidden"
              aria-label="Open chats"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center space-y-8">
              {/* Icon Section */}
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#333333] to-[#1f1f1f] rounded-3xl border-2 border-[#444444] flex items-center justify-center shadow-2xl">
                  <img src="/logo.png" alt="Nuvix AI" className="w-12 h-12" />
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-[#00d4ff] bg-clip-text text-transparent">
                  Welcome to Nuvix AI
                </h1>
                <p className="text-sm text-[#999999] leading-relaxed">
                  Create a new chat to start fresh or continue with created ones
                  from your history.
                </p>
              </div>

              {/* Hint Text */}
              {items.length === 0 && (
                <p className="text-xs text-[#666666] pt-2">
                  No chats yet. Create your first chat to begin!
                </p>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Home;
