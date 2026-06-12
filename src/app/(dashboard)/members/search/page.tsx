"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { searchMembers } from "@/lib/actions/members";

export default function MemberSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) return;

    startTransition(async () => {
      const data = await searchMembers(query.trim());
      setResults(data);
      setSearched(true);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Cari Anggota Keluarga
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Cari anggota atau kepala keluarga berdasarkan nama atau NIK
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan nama atau NIK..."
            disabled={isPending}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary text-text-primary placeholder:text-text-secondary/50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? "Mencari..." : "Cari"}
          </button>
        </form>

        {searched && (
          <div className="border-t border-border pt-4">
            {results.length === 0 ? (
              <p className="text-sm text-text-secondary py-4 text-center">
                Tidak ditemukan anggota dengan kata kunci &quot;{query}&quot;
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-text-secondary">
                  {results.length} hasil ditemukan
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-border table-fixed">
                    <thead className="bg-background">
                      <tr>
                        <th className="th w-1/3">Nama Lengkap</th>
                        <th className="th w-48">NIK</th>
                        <th className="th w-36">Status</th>
                        <th className="th w-48">Nama Keluarga</th>
                        <th className="th w-1/4">Kepala Keluarga</th>
                        <th className="th w-32 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {results.map((member) => (
                        <tr
                          key={`${member.familyId}-${member.nik}-${member.id}`}
                          className="hover:bg-background/40 transition-colors"
                        >
                          <td className="td font-medium">{member.name}</td>
                          <td className="td font-mono text-xs">{member.nik}</td>
                          <td className="td">
                            <span className="rounded bg-background border border-border px-2 py-0.5 text-xs font-medium text-text-secondary">
                              {member.family_status}
                            </span>
                          </td>
                          <td className="td">{member.family_name}</td>
                          <td className="td">{member.head_name}</td>
                          <td className="td text-center">
                            <Link
                              href={`/families/${member.familyId}`}
                              className="rounded-md bg-accent-primary/10 px-3 py-1.5 text-xs font-semibold text-accent-primary hover:bg-accent-primary/20 transition-colors"
                            >
                              Lihat Keluarga
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
