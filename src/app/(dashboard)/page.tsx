import React from "react";
import Link from "next/link";
import { getStats } from "@/lib/actions/stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getStats();
  const topEducation = stats.educationStats.slice(0, 8);
  const topFamilyStatus = stats.familyStatusStats.slice(0, 6);
  const topGender = stats.peopleByGender.slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Selamat datang di portal pendataan IKKFMS (Ikatan Kerukunan Keluarga Feto Mone Sorong)
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Keluarga"
          value={stats.familyCount}
          description="Kepala keluarga terdaftar"
          href="/families"
          icon={<FamilyIcon />}
        />
        <StatCard
          title="Total Anggota"
          value={stats.memberCount}
          description="Anggota keluarga terdaftar"
          href="/members/search"
          icon={<MembersIcon />}
        />
        <StatCard
          title="Total Jiwa"
          value={stats.totalPeople}
          description="Kepala keluarga + anggota"
          href="/families"
          icon={<PeopleIcon />}
        />
        <StatCard
          title="Rata-rata Ukuran Keluarga"
          value={stats.averagePeoplePerFamily}
          description="Rata-rata jiwa per keluarga"
          href="/families"
          icon={<AverageIcon />}
        />
      </div>

      {/* Demographic bars & Growth row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column (wider): Demographic breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard
            title="Komposisi Demografis"
            subtitle="Distribusi data penduduk terdaftar"
            icon={<PeopleIcon />}
          >
            <div className="space-y-6">
              {/* Gender Composition */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Komposisi Gender</h3>
                <div className="space-y-3">
                  {topGender.length === 0 ? (
                    <p className="text-xs text-text-secondary">Belum ada data gender.</p>
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
              </div>

              {/* Education Breakdown */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Tingkat Pendidikan</h3>
                <div className="space-y-3">
                  {topEducation.length === 0 ? (
                    <p className="text-xs text-text-secondary">Belum ada data pendidikan.</p>
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
              </div>

              {/* Relationship Status Breakdown */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Hubungan Keluarga (Anggota)</h3>
                <div className="space-y-3">
                  {topFamilyStatus.length === 0 ? (
                    <p className="text-xs text-text-secondary">Belum ada data status hubungan.</p>
                  ) : (
                    topFamilyStatus.map((item) => (
                      <HorizontalBar
                        key={item.status}
                        label={item.status}
                        value={item.count}
                        total={stats.memberCount || 1}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Right column (narrower): Growth panel */}
        <div className="space-y-6">
          <InfoCard
            title="Pertumbuhan & Aktivitas"
            subtitle="Penambahan data 30 hari terakhir"
            icon={<TrendIcon />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-secondary/10 text-accent-secondary">
                    <FamilyIcon />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-text-secondary">Keluarga Baru</p>
                    <p className="text-xs text-text-secondary">Terdaftar bulan ini</p>
                  </div>
                </div>
                <span className="rounded-full bg-accent-secondary/15 px-3 py-1 font-mono text-base font-bold text-accent-secondary">
                  +{stats.recentFamilyCount}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-secondary/10 text-accent-secondary">
                    <MembersIcon />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-text-secondary">Anggota Baru</p>
                    <p className="text-xs text-text-secondary">Terdaftar bulan ini</p>
                  </div>
                </div>
                <span className="rounded-full bg-accent-secondary/15 px-3 py-1 font-mono text-base font-bold text-accent-secondary">
                  +{stats.recentMemberCount}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-background/30 p-4 text-center">
                <p className="text-xs text-text-secondary">
                  Total data terhimpun saat ini mencapai
                </p>
                <p className="mt-1 font-sans text-2xl font-bold text-text-primary">
                  {stats.totalPeople} <span className="text-sm font-normal text-text-secondary">jiwa</span>
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  href,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {title}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
          {icon}
        </span>
      </div>
      <p className="mt-2 font-mono text-3xl font-bold text-text-primary">
        {value}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{description}</p>
    </Link>
  );
}

function InfoCard({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-4 mb-4">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {title}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {subtitle}
          </p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-text-secondary">
          {icon}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function HorizontalBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
        <p className="font-sans text-text-primary font-medium">{label}</p>
        <p className="font-mono text-text-secondary">
          {value} <span className="text-[10px] text-text-secondary/70">({pct}%)</span>
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background border border-border/50">
        <div
          className="h-full rounded-full bg-accent-primary transition-all duration-500"
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
        d="M17 20h5v-2a3 3 0 00-5-2.83M9 20H4a2 2 0 01-2-2v-1a4 4 0 014-4h3a4 4 0 014 4v1a2 2 0 01-2 2zm3-11a3 3 0 110-6 3 3 0 010 6zm6 3a3 3 0 100-6 3 3 0 000 6z"
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
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
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}
