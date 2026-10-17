"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-3 mb-2 text-lg font-semibold tracking-tight text-[var(--ink)] first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-3 mb-1.5 text-base font-semibold tracking-tight text-[var(--ink)] first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-2.5 mb-1 text-[0.95rem] font-semibold text-[var(--ink)] first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2.5 last:mb-0 leading-relaxed text-[var(--ink-soft)]">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-2.5 ml-4 list-disc space-y-1 text-[var(--ink-soft)] last:mb-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2.5 ml-4 list-decimal space-y-1 text-[var(--ink-soft)] last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-[var(--ink)]">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-2 hover:decoration-[var(--accent)]"
          >
            {children}
          </a>
        ),
        code: ({ className, children }) => {
          const isBlock = Boolean(className);
          if (isBlock) {
            return (
              <code className="font-mono text-[0.8rem] text-[var(--ink)]">{children}</code>
            );
          }
          return (
            <code className="rounded-md bg-[var(--chip)] px-1.5 py-0.5 font-mono text-[0.82rem] text-[var(--ink)]">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-2.5 overflow-x-auto rounded-xl border border-[var(--stroke)] bg-[var(--surface-2)] p-3 last:mb-0">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-2.5 border-l-2 border-[var(--accent)]/50 pl-3 text-[var(--muted)] italic last:mb-0">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="mb-2.5 overflow-x-auto last:mb-0">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-[var(--stroke)] px-2 py-1.5 text-left font-semibold text-[var(--ink)]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-[var(--stroke)]/60 px-2 py-1.5 text-[var(--ink-soft)]">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
