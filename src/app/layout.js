import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <Header />
        <main className="ml-60 min-h-screen bg-zinc-50 pt-20 px-8 pb-8 dark:bg-zinc-850">
          {children}
        </main>
      </body>
    </html>
  );
}
