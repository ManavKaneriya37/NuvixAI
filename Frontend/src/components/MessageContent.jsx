import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import { toast } from "sonner";

const CodeBlock = ({ className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const rawCode = String(children);
  const code = rawCode.replace(/\n$/, "");
  const isBlock = Boolean(match) || rawCode.includes("\n");
  const language = match?.[1]?.toLowerCase() || "text";
  const grammar = Prism.languages[language];
  const highlightedCode = grammar ? Prism.highlight(code, grammar, language) : null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Unable to copy code.");
    }
  };

  if (!isBlock) {
    return <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-[#e8e8e8]" {...props}>{children}</code>;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#151515] shadow-lg">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1d1d1d] px-3 py-2 text-xs text-[#b5b5b5]">
        <span className="font-mono lowercase">{language}</span>
        <button type="button" onClick={copyCode} className="rounded px-2 py-1 hover:bg-white/10 hover:text-white">
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <div className="code-highlight max-w-full overflow-x-auto p-4 text-sm">
        {highlightedCode ? (
          <pre className={`language-${language}`}><code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
        ) : (
          <pre className="font-mono leading-6 text-[#e8e8e8]"><code>{code}</code></pre>
        )}
      </div>
    </div>
  );
};

const MessageContent = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => <h1 className="mb-3 mt-5 text-2xl font-bold text-white first:mt-0">{children}</h1>,
      h2: ({ children }) => <h2 className="mb-2 mt-5 text-xl font-semibold text-white first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-semibold text-white first:mt-0">{children}</h3>,
      p: ({ children }) => <p className="my-3 leading-7 first:mt-0 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5 marker:text-[#a5a5a5]">{children}</ul>,
      ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5 marker:text-[#a5a5a5]">{children}</ol>,
      li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
      blockquote: ({ children }) => <blockquote className="my-4 border-l-2 border-[#8E9BFF] pl-4 italic text-[#c6c6c6]">{children}</blockquote>,
      a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-[#aeb7ff] underline underline-offset-2 hover:text-white">{children}</a>,
      hr: () => <hr className="my-5 border-white/15" />,
      table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
      th: ({ children }) => <th className="border border-white/15 bg-white/5 px-3 py-2 font-semibold">{children}</th>,
      td: ({ children }) => <td className="border border-white/15 px-3 py-2">{children}</td>,
      code: CodeBlock,
    }}
  >
    {content}
  </ReactMarkdown>
);

export default MessageContent;
