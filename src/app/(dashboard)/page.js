import Link from "next/link";
import { getStats } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getStats();
  const topEducation = stats.educationStats.slice(0, 8);
  const topFamilyStatus = stats.familyStatusStats.slice(0, 6);
  const topGender = stats.peopleByGender.slice(0, 4);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Selamat datang di aplikasi pendataan IKKFMS (Ikatan Kerukunan Keluarga
        Feto Mone Sorong)
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Keluarga"
          value={stats.familyCount}
          description="Kepala keluarga terdaftar"
          href="/families"
          icon={<FamilyIcon />}
        />
        <StatCard
          title="Total Anggota (Non-KK)"
          value={stats.memberCount}
          description="Anggota keluarga terdaftar"
          href="/members/search"
          icon={<MembersIcon />}
        />
        <StatCard
          title="Total Jiwa"
          value={stats.totalPeople}
          description="Kepala keluarga + seluruh anggota"
          href="/families"
          icon={<PeopleIcon />}
        />
        <StatCard
          title="Rata-rata Jiwa / Keluarga"
          value={stats.averagePeoplePerFamily}
          description="Ukuran keluarga rata-rata"
          href="/families"
          icon={<AverageIcon />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <InfoCard
          title="Pertumbuhan 30 Hari Terakhir"
          subtitle="Aktivitas input data terbaru"
          icon={<TrendIcon />}
          content={
            <div className="grid grid-cols-2 gap-3">
              <SmallMetric
                label="Keluarga Baru"
                value={stats.recentFamilyCount}
              />
              <SmallMetric
                label="Anggota Baru"
                value={stats.recentMemberCount}
              />
            </div>
          }
        />
        <InfoCard
          title="Komposisi Gender"
          subtitle="Berdasarkan semua data jiwa"
          icon={<GenderIcon />}
          content={
            <div className="space-y-2">
              {topGender.length === 0 ? (
                <p className="text-sm text-zinc-400">Belum ada data.</p>
              ) : (
                topGender.map((item) => (
                  <HorizontalBar
                    key={item.gender}
                    label={item.gender}
                    value={item.count}
                    total={stats.totalPeople || 1}
                  />
                ))
              )}
            </div>
          }
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <InfoCard
          title="Statistik Pendidikan"
          subtitle="Gabungan pendidikan kepala keluarga dan anggota"
          icon={<EducationIcon />}
          content={
            <div className="space-y-2">
              {topEducation.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Belum ada data pendidikan.
                </p>
              ) : (
                topEducation.map((item) => (
                  <HorizontalBar
                    key={item.education}
                    label={item.education}
                    value={item.count}
                    total={stats.totalPeople || 1}
                  />
                ))
              )}
            </div>
          }
        />
        <InfoCard
          title="Status Dalam Keluarga"
          subtitle="Distribusi status anggota non-kepala keluarga"
          icon={<StatusIcon />}
          content={
            <div className="space-y-2">
              {topFamilyStatus.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Belum ada data status anggota.
                </p>
              ) : (
                topFamilyStatus.map((item) => (
                  <HorizontalBar
                    key={item.status}
                    label={item.status || "Tidak diketahui"}
                    value={item.count}
                    total={stats.memberCount || 1}
                  />
                ))
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, description, href, icon }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-850"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </Link>
  );
}

function InfoCard({ title, subtitle, content, icon }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-850">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {icon}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        {subtitle}
      </p>
      <div className="mt-4">{content}</div>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/70">
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function HorizontalBar({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <p className="truncate text-zinc-600 dark:text-zinc-300">{label}</p>
        <p className="whitespace-nowrap font-medium text-zinc-500 dark:text-zinc-400">
          {value} ({pct}%)
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FamilyIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5-2.83M9 20H4a2 2 0 01-2-2v-1a4 4 0 014-4h3a4 4 0 014 4v1a2 2 0 01-2 2zm3-11a3 3 0 110-6 3 3 0 010 6zm6 3a3 3 0 100-6 3 3 0 000 6z"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4a4 4 0 110 8 4 4 0 010-8zm0 10c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"
      />
    </svg>
  );
}

function AverageIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 17l6-6 4 4 8-8M14 7h7v7"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 17l5-5 4 4 8-8M14 8h6v6"
      />
    </svg>
  );
}

function GenderIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7a4 4 0 117.8 1H20m0 0V3m0 5l-4.2-4.2M7 11v10m-3-3h6"
      />
    </svg>
  );
}

function EducationIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14L3 9l9-5 9 5-9 5zm0 0l6.16-3.422A12.083 12.083 0 0118 14.5C18 17.538 15.314 20 12 20s-6-2.462-6-5.5c0-1.323.32-2.579.84-3.922L12 14z"
      />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}
