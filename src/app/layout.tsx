import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocMind — Local Document Intelligence",
  description: "Upload PDFs, PPTXs, and DOCXs, and query them client-side using local vector search, embeddings, and voice capabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper-light text-ink-light dark:bg-paper-dark dark:text-ink-dark font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
