import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vela — AI Personal Assistant",
  description:
    "Vela is an AI-powered personal assistant that helps you streamline workflows, manage information, and clear productive bottlenecks through natural conversation.",
  keywords: [
    "AI assistant",
    "productivity chatbot",
    "personal assistant",
    "workflow",
    "task management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
