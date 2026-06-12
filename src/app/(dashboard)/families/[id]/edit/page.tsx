import React from "react";
import { notFound } from "next/navigation";
import { getFamily } from "@/lib/actions/families";
import FamilyForm from "@/components/families/FamilyForm";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Keluarga - IKKFMS" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFamilyPage({ params }: PageProps) {
  const { id } = await params;
  const family = await getFamily(Number(id));

  if (!family) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Edit Data Keluarga
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ubah informasi identitas keluarga dan kepala keluarga
        </p>
      </div>

      <FamilyForm family={family} />
    </div>
  );
}
