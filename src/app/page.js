import Link from "next/link";
import { getStats } from "@/lib/actions";

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Selamat datang di aplikasi pendataan IKKFMS (Ikatan Kerukunan Keluarga
        Feto Mone Sorong)
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Keluarga"
          value={stats.familyCount}
          description="Keluarga terdaftar"
          href="/families"
        />
        <StatCard
          title="Total Anggota"
          value={stats.memberCount}
          description="Anggota keluarga terdaftar"
          href="/members/search"
        />
        <div className="flex flex-col justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center dark:border-zinc-600 dark:bg-zinc-850">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Mulai tambah data
          </p>
          <Link
            href="/families/new"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Tambah Keluarga
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, href }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-850"
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </Link>
  );
}
