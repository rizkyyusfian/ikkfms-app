import React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { getFamilies } from "@/lib/actions/families";
import SearchBar from "@/components/families/SearchBar";
import ExportButtons from "@/components/families/ExportButtons";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Data Keluarga - IKKFMS" };

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function FamiliesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params?.q || "";
  const page = Number(params?.page || 1);
  const limit = 20;

  const { families, totalCount, totalPages } = await getFamilies(query, page, limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Data Keluarga
          </h1>
          <p className="text-sm text-text-secondary">
            {totalCount} keluarga terdaftar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons />
          <Link href="/families/new" className="btn-primary">
            + Tambah Keluarga
          </Link>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
        <Suspense fallback={<div className="h-10 w-full bg-background animate-pulse rounded-lg" />}>
          <SearchBar placeholder="Cari berdasarkan nama kepala, NIK, atau nama keluarga..." />
        </Suspense>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border table-fixed">
            <thead className="bg-background">
              <tr>
                <th className="th w-16 text-center">No</th>
                <th className="th w-1/4">Nama Keluarga</th>
                <th className="th w-1/4">Kepala Keluarga</th>
                <th className="th w-48">NIK</th>
                <th className="th w-40">Telepon</th>
                <th className="th w-28 text-center">Anggota</th>
                <th className="th w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {families.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-text-secondary"
                  >
                    {query
                      ? "Tidak ada hasil untuk pencarian tersebut."
                      : "Belum ada data keluarga terdaftar — tambah keluarga pertama"}
                  </td>
                </tr>
              ) : (
                families.map((family, index) => {
                  const absoluteIndex = (page - 1) * limit + index + 1;
                  return (
                    <tr
                      key={family.id}
                      className="hover:bg-background/40 transition-colors"
                    >
                      <td className="td text-center font-mono text-xs">{absoluteIndex}</td>
                      <td className="td font-medium">{family.familyName}</td>
                      <td className="td">{family.headName}</td>
                      <td className="td font-mono text-xs">{family.headNik}</td>
                      <td className="td font-mono text-xs">{family.headPhone || "-"}</td>
                      <td className="td text-center font-mono">{family.member_count}</td>
                      <td className="td text-center">
                        <Link
                          href={`/families/${family.id}`}
                          className="rounded-md bg-accent-primary/10 px-3 py-1.5 text-xs font-semibold text-accent-primary hover:bg-accent-primary/20 transition-colors"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-text-secondary">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <Link
                href={`?q=${query}&page=${page - 1}`}
                className={`btn-secondary text-xs py-1 px-3 ${
                  page <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Sebelumnya
              </Link>
              <Link
                href={`?q=${query}&page=${page + 1}`}
                className={`btn-secondary text-xs py-1 px-3 ${
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Berikutnya
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
