import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import MessageContent from "./MessageContent";

const Room = ({
  chatId,
  messages,
  onSendMessage,
  isLoadingChats,
  isTyping,
  onOpenSidebar,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive or AI starts typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyMessage = async (content) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      toast.success("Message copied.");
    } catch {
      toast.error("Unable to copy the message.");
    }
  };

  return (
    <main className="min-w-0 flex-1 flex flex-col h-full bg-[#212121]">
      {/* Top Navigation / Header */}
      <div className="h-14 flex flex-shrink-0 items-center justify-between px-3 sm:px-4 border-b border-[#2B2B2B]/50">
        <div className="flex items-center gap-3">
          <button onClick={onOpenSidebar} className="rounded p-1 text-[#888888] hover:bg-white/5 hover:text-white transition-colors md:hidden" aria-label="Open chats">
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
          <span className="font-medium text-base sm:text-lg">
            NUVIX{" "}
            <span className="text-xs text-gray-500">
              1.0(Powered by Gemini)
            </span>
          </span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-6 md:px-12 lg:px-24 xl:px-48 space-y-8">
        {isLoadingChats && (
          <div className="h-full flex items-center justify-center text-[#888888]">
            Loading chats...
          </div>
        )}

        {!isLoadingChats && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#888888]">
            <p className="text-lg mb-2">How can I help you today?</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role !== "user" && (
              <div className="mr-2 h-7 w-7 rounded-lg bg-[#2B2B2B] sm:mr-4 sm:h-8 sm:w-8 flex-shrink-0 flex items-center justify-center border border-[#333333]">
                <img
                  src="/logo.png"
                  alt="AI"
                  className="w-5 h-5 object-contain"
                />
              </div>
            )}

            <div
              className={`group relative max-w-[94%] sm:max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 ${
                msg.role === "user"
                  ? "bg-[#2F2F2F] text-white"
                  : "bg-transparent text-[#E0E0E0]"
              }`}
            >
              <MessageContent content={msg.content} />
              <button
                type="button"
                onClick={() => handleCopyMessage(msg.content)}
                className="cursor-pointer absolute -bottom-8 left-2 flex h-7 items-center gap-1 rounded-md bg-[#303030] px-2 text-xs text-[#D1D1D1] opacity-0 shadow transition hover:text-white group-hover:opacity-100 focus:opacity-100"
                aria-label="Copy message"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-center">
            <div className="h-7 w-7 mr-2 sm:mr-4 sm:h-8 sm:w-8 rounded-lg bg-[#2B2B2B] flex-shrink-0 flex items-center justify-center border border-[#333333]">
              <img
                src="/logo.png"
                alt="AI"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="bg-transparent px-4 py-3 flex gap-1.5 items-center h-[52px]">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full bg-[#888888] animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-6 md:px-12 lg:px-24 xl:px-48">
        <form
          onSubmit={handleSubmit}
          className="relative bg-[#2F2F2F] rounded-2xl border border-[#3A3A3A] focus-within:border-[#555555] focus-within:ring-1 focus-within:ring-[#555555] transition-all"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nuvix AI..."
            className="w-full bg-transparent text-white placeholder-[#888888] rounded-2xl px-4 py-3.5 pr-14 resize-none focus:outline-none max-h-48 overflow-y-auto"
            rows="1"
            style={{ minHeight: "56px" }}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || !chatId || isTyping}
            className={`absolute right-3 bottom-3 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              inputValue.trim() && chatId && !isTyping
                ? "bg-[#8E9BFF] text-white hover:bg-[#7A88FF]"
                : "bg-[#444444] text-[#888888] cursor-not-allowed"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-[#666666] mt-3">
          Nuvix AI can make mistakes. Check important information.
        </p>
      </div>
    </main>
  );
};

export default Room;
