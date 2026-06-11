import Link from "next/link";
import { Suspense } from "react";
import { getFamiliesWithMembers } from "@/lib/actions";
import SearchBar from "@/components/SearchBar";
import ExportButtons from "@/components/ExportButtons";

export const metadata = { title: "Data Keluarga - IKKFMS" };

export default async function FamiliesPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const families = await getFamiliesWithMembers(query);

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
        <div className="flex items-center gap-2">
          <ExportButtons families={families} />
          <Link href="/families/new" className="btn-primary">
            + Tambah Keluarga
          </Link>
        </div>
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
              <th className="th">Nama Kepala</th>
              {/* <th className="th">TTL Kepala</th> */}
              <th className="th">L/P</th>
              <th className="th">Telepon</th>
              <th className="th">Nama Pasangan</th>
              <th className="th">Alamat</th>
              <th className="th">Anggota</th>
              {/* <th className="th">Dibuat</th> */}
              <th className="th">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-700 dark:bg-zinc-850">
            {families.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
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
                  <td className="td">{family.head_name}</td>
                  {/* <td className="td text-xs">
                    {formatBirthInfo(
                      family.head_birth_place,
                      family.head_birth_date,
                    )}
                  </td> */}
                  <td className="td text-center">
                    {family.head_gender === "Laki-laki"
                      ? "L"
                      : family.head_gender === "Perempuan"
                        ? "P"
                        : "-"}
                  </td>
                  <td className="td">{family.head_phone || "-"}</td>
                  <td className="td">{family.wife_name || "-"}</td>
                  <td className="td whitespace-normal min-w-60">
                    {family.home_address || "-"}
                  </td>
                  <td className="td text-center">{family.member_count}</td>
                  {/* <td className="td text-xs">
                    {formatDateTime(family.created_at)}
                  </td> */}
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

function formatBirthInfo(place, date) {
  const parts = [];
  if (place) parts.push(place);
  if (date) {
    const d = new Date(date);
    parts.push(
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }
  return parts.join(", ") || "-";
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
