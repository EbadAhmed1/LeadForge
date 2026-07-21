import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadForge — B2B Lead Intelligence & Precise Outreach",
  description: "Automated B2B lead scraping, ICP qualification, and personalized cold outreach generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${newsreader.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#1C1917]">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
