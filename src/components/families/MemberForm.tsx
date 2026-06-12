"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMember, updateMember } from "@/lib/actions/members";
import Toast from "@/components/ui/Toast";
import { Member, FamilyStatus, Education, Gender } from "@prisma/client";

const EDUCATION_OPTIONS = [
  { value: "SD", label: "SD" },
  { value: "SMP", label: "SMP" },
  { value: "SMA", label: "SMA" },
  { value: "SMK", label: "SMK" },
  { value: "D3", label: "D3" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
  { value: "LAINNYA", label: "Lainnya" },
];

const STATUS_OPTIONS = [
  { value: "ISTRI", label: "Istri" },
  { value: "ANAK", label: "Anak" },
  { value: "CUCU", label: "Cucu" },
  { value: "MENANTU", label: "Menantu" },
  { value: "ORANG_TUA", label: "Orang Tua" },
  { value: "LAINNYA", label: "Lainnya" },
];

export default function MemberForm({
  familyId,
  member = null,
}: {
  familyId: number;
  member: Member | null;
}) {
  const router = useRouter();
  const isEditing = !!member;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [familyStatus, setFamilyStatus] = useState<string>(member?.familyStatus || "ANAK");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  function validate(formData: FormData) {
    const errs: Record<string, string> = {};
    const nik = formData.get("nik")?.toString().trim();
    const name = formData.get("name")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const status = formData.get("family_status")?.toString();
    const childOrder = formData.get("child_order")?.toString().trim();

    if (!nik) {
      errs.nik = "NIK wajib diisi.";
    } else if (!/^\d{16}$/.test(nik)) {
      errs.nik = "NIK harus terdiri dari 16 digit angka.";
    }
    if (!name) errs.name = "Nama lengkap wajib diisi.";
    if (phone && !/^\d{8,15}$/.test(phone)) {
      errs.phone = "Nomor telepon tidak valid (8-15 digit angka).";
    }
    if (status === "ANAK") {
      if (!childOrder || isNaN(Number(childOrder))) {
        errs.child_order = "Urutan anak wajib diisi untuk status Anak.";
      }
    }
    return errs;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setToast({ message: "Silakan periksa input Anda.", type: "error" });
      return;
    }
    setErrors({});

    startTransition(async () => {
      let result;
      if (isEditing && member) {
        result = await updateMember(member.id, familyId, null, formData);
      } else {
        result = await createMember(familyId, null, formData);
      }

      if (result?.error) {
        setToast({ message: result.error, type: "error" });
      } else {
        setToast({
          message: isEditing ? "Data anggota berhasil diperbarui." : "Anggota keluarga baru berhasil ditambahkan.",
          type: "success",
        });
        setTimeout(() => {
          router.push(`/families/${familyId}`);
          router.refresh();
        }, 1000);
      }
    });
  }

  return (
    <div className="mx-auto max-w-[640px] rounded-xl border border-border bg-surface p-6 shadow-sm">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {isEditing ? "Edit Data Anggota" : "Tambah Anggota Keluarga"}
        </h2>

        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <label className="label">NIK *</label>
            <input
              name="nik"
              required
              maxLength={16}
              defaultValue={member?.nik}
              placeholder="16 digit NIK"
              className={`input-field font-mono ${errors.nik ? "border-danger" : ""}`}
            />
            {errors.nik && (
              <p className="mt-1 text-xs text-danger">{errors.nik}</p>
            )}
          </div>
          <div>
            <label className="label">Nama Lengkap *</label>
            <input
              name="name"
              required
              defaultValue={member?.name}
              placeholder="Nama lengkap anggota"
              className={`input-field ${errors.name ? "border-danger" : ""}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="label">Tempat Lahir</label>
            <input
              name="birth_place"
              defaultValue={member?.birthPlace || ""}
              placeholder="Tempat Lahir"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Tanggal Lahir</label>
            <input
              type="date"
              name="birth_date"
              defaultValue={formatDateForInput(member?.birthDate || null)}
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="label">Jenis Kelamin</label>
            <select
              name="gender"
              defaultValue={member?.gender || "LAKI_LAKI"}
              className="input-field"
            >
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="label">Status Hubungan *</label>
            <select
              name="family_status"
              required
              defaultValue={familyStatus}
              onChange={(e) => setFamilyStatus(e.target.value)}
              className="input-field"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Child Order field */}
          {familyStatus === "ANAK" && (
            <div>
              <label className="label">Urutan Anak *</label>
              <input
                type="number"
                name="child_order"
                min={1}
                max={20}
                required
                defaultValue={member?.childOrder || ""}
                placeholder="Contoh: 1 (untuk Anak ke-1)"
                className={`input-field font-mono ${errors.child_order ? "border-danger" : ""}`}
              />
              {errors.child_order && (
                <p className="mt-1 text-xs text-danger">{errors.child_order}</p>
              )}
            </div>
          )}

          <div>
            <label className="label">Pendidikan Terakhir</label>
            <select
              name="education"
              defaultValue={member?.education || ""}
              className="input-field"
            >
              <option value="">-- Pilih --</option>
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Pekerjaan</label>
            <input
              name="job"
              defaultValue={member?.job || ""}
              placeholder="Pekerjaan"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">No. Telepon</label>
            <input
              name="phone"
              defaultValue={member?.phone || ""}
              placeholder="8-15 digit angka"
              className={`input-field font-mono ${errors.phone ? "border-danger" : ""}`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-danger">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="btn-secondary"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Anggota"}
          </button>
        </div>
      </form>
    </div>
  );
}
