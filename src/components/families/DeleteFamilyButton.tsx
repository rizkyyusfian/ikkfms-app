"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFamily } from "@/lib/actions/families";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";

export default function DeleteFamilyButton({ familyId }: { familyId: number }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFamily(familyId);
      if (result?.error) {
        setToast({ message: result.error, type: "error" });
        setIsOpen(false);
      } else {
        setToast({ message: "Keluarga berhasil dihapus.", type: "success" });
        setTimeout(() => {
          router.push("/families");
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
        className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white shadow-sm cursor-pointer hover:bg-danger/90 transition-colors"
      >
        Hapus Keluarga
      </button>

      <ConfirmationModal
        isOpen={isOpen}
        title="Hapus Keluarga?"
        message="Apakah Anda yakin ingin menghapus data keluarga ini beserta seluruh anggotanya? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        isPending={isPending}
      />
    </>
  );
}
