import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFamily } from "@/lib/actions/families";
import DeleteFamilyButton from "@/components/families/DeleteFamilyButton";
import DeleteMemberButton from "@/components/families/DeleteMemberButton";
import ExportButtons from "@/components/families/ExportButtons";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const family = await getFamily(Number(id));
  return {
    title: family ? `${family.familyName} - IKKFMS` : "Keluarga Tidak Ditemukan",
  };
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FamilyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const family = await getFamily(Number(id));

  if (!family) notFound();

  // Sort members: Istri first -> Anak by childOrder -> others alphabetically by name
  const sortedMembers = [...family.members].sort((a, b) => {
    if (a.familyStatus === "ISTRI") return -1;
    if (b.familyStatus === "ISTRI") return 1;

    if (a.familyStatus === "ANAK" && b.familyStatus === "ANAK") {
      return (a.childOrder || 99) - (b.childOrder || 99);
    }
    if (a.familyStatus === "ANAK") return -1;
    if (b.familyStatus === "ANAK") return 1;

    return a.name.localeCompare(b.name);
  });

  const formatBirthInfo = (place: string | null, date: Date | null): string => {
    const parts = [];
    if (place) parts.push(place);
    if (date) {
      parts.push(
        new Date(date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }
    return parts.join(", ") || "-";
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Back Link & Page Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/families"
            className="text-sm font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            &larr; Kembali ke Daftar Keluarga
          </Link>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-text-primary">
            Detail: {family.familyName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButtons familyId={family.id} />
          <Link href={`/families/${id}/edit`} className="btn-secondary text-xs py-1.5">
            Edit Keluarga
          </Link>
          <DeleteFamilyButton familyId={family.id} />
        </div>
      </div>

      {/* Main Grid: Sticky head of household card on left, members table on right */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Head of Household Card (Sticky) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary pb-3 border-b border-border">
              Kepala Keluarga
            </h2>
            <div className="space-y-3">
              <InfoItem label="Nama Lengkap" value={family.headName} />
              <InfoItem label="NIK" value={family.headNik} mono />
              <InfoItem
                label="Tempat, Tanggal Lahir"
                value={formatBirthInfo(family.headBirthPlace, family.headBirthDate)}
              />
              <InfoItem label="Jenis Kelamin" value={family.headGender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"} />
              <InfoItem label="Pendidikan" value={family.headEducation || "-"} />
              <InfoItem label="Pekerjaan" value={family.headJob || "-"} />
              <InfoItem label="Telepon" value={family.headPhone || "-"} mono />
              <InfoItem label="Nama Istri/Pasangan" value={family.wifeName || "-"} />
              <InfoItem label="Alamat Rumah" value={family.homeAddress || "-"} />
            </div>
          </div>
        </div>

        {/* Right Column: Member List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Anggota Keluarga ({family.members.length})
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Daftar istri, anak, dan kerabat dalam satu kartu keluarga
                </p>
              </div>
              <Link
                href={`/families/${id}/members/new`}
                className="btn-primary text-xs py-1.5"
              >
                + Tambah Anggota
              </Link>
            </div>

            {family.members.length === 0 ? (
              <p className="py-12 text-center text-sm text-text-secondary">
                Belum ada anggota keluarga terdaftar.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border table-fixed">
                  <thead className="bg-background">
                    <tr>
                      <th className="th w-12 text-center">No</th>
                      <th className="th w-48">NIK</th>
                      <th className="th w-1/3">Nama Lengkap</th>
                      <th className="th w-32">Hubungan</th>
                      <th className="th w-32">L/P</th>
                      <th className="th w-40">TTL</th>
                      <th className="th w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {sortedMembers.map((member, index) => (
                      <tr
                        key={member.id}
                        className="hover:bg-background/40 transition-colors"
                      >
                        <td className="td text-center font-mono text-xs">{index + 1}</td>
                        <td className="td font-mono text-xs">{member.nik}</td>
                        <td className="td font-medium">{member.name}</td>
                        <td className="td">
                          <span className="rounded bg-background border border-border px-2 py-0.5 text-xs font-medium text-text-secondary">
                            {member.familyStatus === "ISTRI"
                              ? "Istri"
                              : member.familyStatus === "ANAK"
                              ? `Anak ke-${member.childOrder}`
                              : member.familyStatus === "CUCU"
                              ? "Cucu"
                              : member.familyStatus === "MENANTU"
                              ? "Menantu"
                              : member.familyStatus === "ORANG_TUA"
                              ? "Orang Tua"
                              : "Lainnya"}
                          </span>
                        </td>
                        <td className="td text-center">
                          {member.gender === "LAKI_LAKI" ? "L" : member.gender === "PEREMPUAN" ? "P" : "-"}
                        </td>
                        <td className="td text-xs truncate max-w-40" title={formatBirthInfo(member.birthPlace, member.birthDate)}>
                          {formatBirthInfo(member.birthPlace, member.birthDate)}
                        </td>
                        <td className="td text-center">
                          <div className="flex gap-2 justify-center">
                            <Link
                              href={`/families/${id}/members/${member.id}/edit`}
                              className="rounded-md bg-accent-primary/10 px-2 py-1.5 text-xs font-semibold text-accent-primary hover:bg-accent-primary/20 transition-colors"
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
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm text-text-primary leading-tight ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
