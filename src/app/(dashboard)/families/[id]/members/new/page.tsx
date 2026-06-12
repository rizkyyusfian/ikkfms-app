import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFamily } from "@/lib/actions/families";
import MemberForm from "@/components/families/MemberForm";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Tambah Anggota - IKKFMS" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewMemberPage({ params }: PageProps) {
  const { id } = await params;
  const family = await getFamily(Number(id));

  if (!family) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/families/${id}`}
          className="text-sm font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors"
        >
          &larr; Kembali ke Detail {family.familyName}
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-text-primary">
          Tambah Anggota Keluarga
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Masukkan data diri anggota baru untuk keluarga {family.familyName}
        </p>
      </div>

      <MemberForm familyId={family.id} member={null} />
    </div>
  );
}
