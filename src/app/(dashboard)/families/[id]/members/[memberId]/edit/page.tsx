import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember } from "@/lib/actions/members";
import MemberForm from "@/components/families/MemberForm";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Anggota - IKKFMS" };

type PageProps = {
  params: Promise<{ id: string; memberId: string }>;
};

export default async function EditMemberPage({ params }: PageProps) {
  const { id, memberId } = await params;
  const member = await getMember(Number(memberId));

  if (!member) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/families/${id}`}
          className="text-sm font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors"
        >
          &larr; Kembali ke Detail Keluarga
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-text-primary">
          Edit Anggota Keluarga
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ubah data diri untuk {member.name}
        </p>
      </div>

      <MemberForm familyId={Number(id)} member={member} />
    </div>
  );
}
