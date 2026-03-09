"use client";

import { useState } from "react";
import Link from "next/link";
import { searchMembers } from "@/lib/actions";

export default function MemberSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const data = await searchMembers(query.trim());
    setResults(data);
    setSearched(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Cari Anggota Keluarga
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Cari anggota berdasarkan nama atau NIK untuk melihat keluarga mana
        mereka tergabung
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik nama atau NIK..."
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button type="submit" className="btn-primary">
          Cari
        </button>
      </form>

      {searched && (
        <div className="mt-6">
          {results.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Tidak ditemukan anggota dengan kata kunci &quot;{query}&quot;
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-zinc-500">
                {results.length} hasil ditemukan
              </p>
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                  <thead className="bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      <th className="th">Nama</th>
                      <th className="th">NIK</th>
                      <th className="th">Status</th>
                      <th className="th">Keluarga</th>
                      <th className="th">Kepala Keluarga</th>
                      <th className="th">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {results.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <td className="td font-medium">{member.name}</td>
                        <td className="td font-mono text-xs">{member.nik}</td>
                        <td className="td">
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                            {member.family_status}
                          </span>
                        </td>
                        <td className="td">{member.family_name}</td>
                        <td className="td">{member.head_name}</td>
                        <td className="td">
                          <Link
                            href={`/families/${member.family_id}`}
                            className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            Lihat Keluarga
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
