"use client";

import { deleteMember } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DeleteMemberButton({ memberId, familyId }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus anggota keluarga ini?")) return;
    await deleteMember(memberId, familyId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
    >
      Hapus
    </button>
  );
}
