import Link from "next/link";
import { Suspense } from "react";
import { getFamilies } from "@/lib/actions";
import SearchBar from "@/components/SearchBar";

export const metadata = { title: "Data Keluarga - IKKFMS" };

export default async function FamiliesPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const families = await getFamilies(query);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Data Keluarga
          </h1>
          <p className="text-sm text-zinc-500">
            {families.length} keluarga terdaftar
          </p>
        </div>
        <Link href="/families/new" className="btn-primary">
          + Tambah Keluarga
        </Link>
      </div>

      <div className="mt-6">
        <Suspense fallback={null}>
          <SearchBar placeholder="Cari berdasarkan nama, NIK, atau nama keluarga..." />
        </Suspense>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="th">No</th>
              <th className="th">Nama Keluarga</th>
              <th className="th">NIK Kepala</th>
              <th className="th">Kepala Keluarga</th>
              <th className="th">Alamat</th>
              <th className="th">Anggota</th>
              <th className="th">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-700 dark:bg-zinc-850">
            {families.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-zinc-400"
                >
                  {query
                    ? "Tidak ada hasil untuk pencarian tersebut."
                    : "Belum ada data keluarga. Mulai tambah data!"}
                </td>
              </tr>
            ) : (
              families.map((family, index) => (
                <tr
                  key={family.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="td text-center">{index + 1}</td>
                  <td className="td font-medium">{family.family_name}</td>
                  <td className="td font-mono text-xs">{family.head_nik}</td>
                  <td className="td">{family.head_name}</td>
                  <td className="td max-w-[200px] truncate">
                    {family.home_address || "-"}
                  </td>
                  <td className="td text-center">{family.member_count}</td>
                  <td className="td">
                    <Link
                      href={`/families/${family.id}`}
                      className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
