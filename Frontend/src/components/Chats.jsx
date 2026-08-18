import { useMemo, useState } from "react";

const Chats = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  isCreating,
  renamingChatId,
  deletingChatId,
  userName = "User",
  isOpen,
  onClose,
  onLogout,
  isLoggingOut,
}) => {
  const [draftTitle, setDraftTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [chatToRename, setChatToRename] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return query
      ? chats.filter((chat) => chat.title.toLowerCase().includes(query))
      : chats;
  }, [chats, searchTerm]);

  const handleCreateChat = () => {
    const title = draftTitle.trim();
    if (!title) return;
    onNewChat(title)
      .then(() => {
        setDraftTitle("");
        setShowModal(false);
      })
      .catch(() => undefined);
  };

  const handleDeleteChat = (chat) => {
    if (window.confirm(`Delete “${chat.title}”? This cannot be undone.`))
      onDeleteChat(chat._id).catch(() => undefined);
  };

  const handleRenameChat = () => {
    const title = draftTitle.trim();
    if (!title || !chatToRename) return;
    onRenameChat(chatToRename._id, title)
      .then(() => {
        setChatToRename(null);
        setDraftTitle("");
      })
      .catch(() => undefined);
  };

  const openRenameDialog = (chat) => {
    setChatToRename(chat);
    setDraftTitle(chat.title);
  };

  const closeRenameDialog = () => {
    if (renamingChatId) return;
    setChatToRename(null);
    setDraftTitle("");
  };

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U";

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[min(82vw,280px)] flex-col border-r border-[#2B2B2B] bg-[#171717] shadow-2xl transition-transform duration-200 md:static md:h-full md:w-[280px] md:translate-x-0 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#232323] rounded-lg border border-[#333333] flex items-center justify-center p-1.5">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-semibold tracking-wide text-sm">Nuvix AI</span>
        <button onClick={onClose} className="ml-auto rounded p-1 text-[#888888] hover:text-white md:hidden" aria-label="Close chats">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 6-12 12M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#212121] hover:bg-[#2B2B2B] border border-[#333333] rounded-lg text-sm font-medium transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
        <button
          onClick={() => setIsSearchOpen((value) => !value)}
          className="w-10 h-10 flex items-center justify-center bg-[#212121] hover:bg-[#2B2B2B] border border-[#333333] rounded-lg transition-colors"
          aria-label="Search chats"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>

      {isSearchOpen && (
        <div className="px-3 pb-3">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search chats..."
            autoFocus
            className="w-full rounded-lg border border-[#333333] bg-[#121212] px-3 py-2 text-sm text-white outline-none focus:border-white"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsSearchOpen(false);
                setSearchTerm("");
              }
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 custom-scrollbar">
        {filteredChats.map((chat) => (
          <div
            key={chat._id}
            className={`group flex items-center rounded-lg transition-colors ${activeChatId === chat._id ? "bg-[#2B2B2B]" : "hover:bg-[#232323]"}`}
          >
            <button
              onClick={() => openRenameDialog(chat)}
              disabled={renamingChatId === chat._id}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-[#888888] opacity-0 transition hover:bg-[#3A3A3A] hover:text-white disabled:cursor-not-allowed group-hover:opacity-100 focus:opacity-100"
              aria-label={`Rename ${chat.title}`}
              title="Rename chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              onClick={() => {
                onSelectChat(chat._id);
                onClose?.();
              }}
              className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm ${activeChatId === chat._id ? "text-white" : "text-[#D1D1D1]"}`}
            >
              {chat.title}
            </button>
            <button
              onClick={() => handleDeleteChat(chat)}
              disabled={deletingChatId === chat._id}
              className="mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-[#888888] opacity-0 transition hover:bg-[#3A3A3A] hover:text-red-400 disabled:cursor-not-allowed group-hover:opacity-100 focus:opacity-100"
              aria-label={`Delete ${chat.title}`}
              title="Delete chat"
            >
              {deletingChatId === chat._id ? (
                "…"
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
                </svg>
              )}
            </button>
          </div>
        ))}
        {searchTerm && filteredChats.length === 0 && (
          <p className="px-3 py-4 text-center text-sm text-[#888888]">
            No chats found.
          </p>
        )}
      </div>

      <div className="p-4 border-t border-[#2B2B2B] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2B4B8C] flex items-center justify-center text-xs font-semibold text-white">
          {initials}
        </div>
        <div className="flex-1 truncate">
          <p className="text-sm font-medium truncate">{userName}</p>
        </div>
        <button onClick={onLogout} disabled={isLoggingOut} className="rounded-md p-2 text-[#888888] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed" aria-label="Log out" title="Log out">
          {isLoggingOut ? "..." : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></svg>}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-2xl border border-[#2B2B2B] bg-[#171717] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-3">
              Create new chat
            </h3>
            <input
              type="text"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Enter chat name"
              className="w-full rounded-lg border border-[#333333] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none focus:border-white"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreateChat();
                if (event.key === "Escape") {
                  setShowModal(false);
                  setDraftTitle("");
                }
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDraftTitle("");
                }}
                className="rounded-lg border border-[#333333] bg-transparent px-3 py-2 text-sm text-gray-300 hover:bg-[#232323]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                disabled={!draftTitle.trim() || isCreating}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {chatToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-2xl border border-[#2B2B2B] bg-[#171717] p-5 shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold text-white">Rename chat</h3>
            <input
              type="text"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Enter chat name"
              className="w-full rounded-lg border border-[#333333] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none focus:border-white"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") handleRenameChat();
                if (event.key === "Escape") closeRenameDialog();
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeRenameDialog} disabled={Boolean(renamingChatId)} className="rounded-lg border border-[#333333] bg-transparent px-3 py-2 text-sm text-gray-300 hover:bg-[#232323] disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
              <button onClick={handleRenameChat} disabled={!draftTitle.trim() || Boolean(renamingChatId)} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50">
                {renamingChatId ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Chats;
