import Link from "next/link";
import { notFound } from "next/navigation";
import { getFamily } from "@/lib/actions";
import DeleteFamilyButton from "@/components/DeleteFamilyButton";
import DeleteMemberButton from "@/components/DeleteMemberButton";
import ExportButtons from "@/components/ExportButtons";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const family = await getFamily(Number(id));
  return {
    title: family
      ? `${family.family_name} - IKKFMS`
      : "Keluarga Tidak Ditemukan",
  };
}

export default async function FamilyDetailPage({ params }) {
  const { id } = await params;
  const family = await getFamily(Number(id));

  if (!family) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/families"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Kembali ke Daftar
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {family.family_name}
          </h1>
        </div>
        <div className="flex gap-2">
          <ExportButtons
            families={[family]}
            fileNamePrefix={`Keluarga_${family.family_name}_IKKFMS`}
          />
          <Link href={`/families/${id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <DeleteFamilyButton familyId={family.id} />
        </div>
      </div>

      {/* Head of Family Info */}
      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-850">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Kepala Keluarga
        </h2>
        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="NIK" value={family.head_nik} mono />
          <InfoItem label="Nama Lengkap" value={family.head_name} />
          <InfoItem
            label="Tempat, Tanggal Lahir"
            value={formatBirthInfo(
              family.head_birth_place,
              family.head_birth_date,
            )}
          />
          <InfoItem label="Jenis Kelamin" value={family.head_gender} />
          <InfoItem label="Pekerjaan" value={family.head_job} />
          <InfoItem label="Pendidikan" value={family.head_education} />
          <InfoItem label="Telepon" value={family.head_phone} />
          <InfoItem label="Nama Istri" value={family.wife_name} />
          <InfoItem label="Alamat Rumah" value={family.home_address} />
        </div>
      </section>

      {/* Members */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Anggota Keluarga ({family.members.length})
          </h2>
          <Link
            href={`/families/${id}/members/new`}
            className="btn-primary text-sm"
          >
            + Tambah Anggota
          </Link>
        </div>

        {family.members.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            Belum ada anggota keluarga yang ditambahkan.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="th">No</th>
                  <th className="th">NIK</th>
                  <th className="th">Nama</th>
                  <th className="th">Tempat Lahir</th>
                  <th className="th">Tanggal Lahir</th>
                  <th className="th">L/P</th>
                  <th className="th">Status</th>
                  <th className="th">Urutan Anak</th>
                  <th className="th">Pekerjaan</th>
                  <th className="th">Pendidikan</th>
                  <th className="th">Telepon</th>
                  <th className="th">Dibuat</th>
                  <th className="th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-700 dark:bg-zinc-850">
                {family.members.map((member, index) => (
                  <tr
                    key={member.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="td text-center">{index + 1}</td>
                    <td className="td font-mono text-xs">{member.nik}</td>
                    <td className="td font-medium">{member.name}</td>
                    <td className="td text-xs">{member.birth_place || "-"}</td>
                    <td className="td text-xs">
                      {formatDate(member.birth_date)}
                    </td>
                    <td className="td text-center">
                      {member.gender === "Laki-laki" ? "L" : "P"}
                    </td>
                    <td className="td">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                        {member.family_status || "-"}
                      </span>
                    </td>
                    <td className="td text-center text-xs">
                      {member.child_order || "-"}
                    </td>
                    <td className="td text-xs">{member.job || "-"}</td>
                    <td className="td text-xs">{member.education || "-"}</td>
                    <td className="td text-xs">{member.phone || "-"}</td>
                    <td className="td text-xs">
                      {formatDate(member.created_at)}
                    </td>
                    <td className="td">
                      <div className="flex gap-1">
                        <Link
                          href={`/families/${id}/members/${member.id}/edit`}
                          className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          Edit
                        </Link>
                        <DeleteMemberButton
                          memberId={member.id}
                          familyId={family.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm text-zinc-900 dark:text-zinc-100 ${mono ? "font-mono" : ""}`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function formatBirthInfo(place, date) {
  const parts = [];
  if (place) parts.push(place);
  if (date) parts.push(formatDate(date));
  return parts.join(", ") || "-";
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
