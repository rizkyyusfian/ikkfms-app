import React from "react";
import FamilyForm from "@/components/families/FamilyForm";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Tambah Keluarga - IKKFMS" };

export default function NewFamilyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Tambah Keluarga Baru
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Masukkan informasi identitas keluarga dan kepala keluarga
        </p>
      </div>

      <FamilyForm family={null} />
    </div>
  );
}
