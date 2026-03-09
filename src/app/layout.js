import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "IKKFMS - Pendataan Keluarga",
  description:
    "Aplikasi Pendataan Keluarga IKKFMS (Ikatan Kerukunan Keluarga Feto Mone Sorong)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <main className="ml-60 min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
          {children}
        </main>
      </body>
    </html>
  );
}
