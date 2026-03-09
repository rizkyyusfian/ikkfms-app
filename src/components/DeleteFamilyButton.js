"use client";

import { useRouter } from "next/navigation";
import { deleteFamily } from "@/lib/actions";

export default function DeleteFamilyButton({ familyId }) {
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        "Yakin ingin menghapus data keluarga ini? Semua anggota keluarga akan ikut terhapus.",
      )
    ) {
      return;
    }
    await deleteFamily(familyId);
    router.push("/families");
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
    >
      Hapus Keluarga
    </button>
  );
}
