import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-60 min-h-screen bg-zinc-50 pt-20 px-8 pb-8 dark:bg-zinc-850">
        {children}
      </main>
    </>
  );
}
