"use client";

import React, { useState, useTransition } from "react";
import { deleteMember } from "@/lib/actions/members";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";

export default function DeleteMemberButton({
  memberId,
  familyId,
}: {
  memberId: number;
  familyId: number;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMember(memberId, familyId);
      if (result?.error) {
        setToast({ message: result.error, type: "error" });
        setIsOpen(false);
      } else {
        setToast({ message: "Anggota keluarga berhasil dihapus.", type: "success" });
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    });
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors cursor-pointer"
      >
        Hapus
      </button>

      <ConfirmationModal
        isOpen={isOpen}
        title="Hapus Anggota Keluarga?"
        message="Apakah Anda yakin ingin menghapus data anggota keluarga ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        isPending={isPending}
      />
    </>
  );
}
