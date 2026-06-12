"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFamily, updateFamily } from "@/lib/actions/families";
import Toast from "@/components/ui/Toast";
import { Family } from "@prisma/client";

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

export default function FamilyForm({ family = null }: { family: Family | null }) {
  const router = useRouter();
  const isEditing = !!family;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [headGender, setHeadGender] = useState(family?.headGender || "LAKI_LAKI");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  function validate(formData: FormData) {
    const errs: Record<string, string> = {};
    const familyName = formData.get("family_name")?.toString().trim();
    const nik = formData.get("head_nik")?.toString().trim();
    const headName = formData.get("head_name")?.toString().trim();
    const phone = formData.get("head_phone")?.toString().trim();

    if (!familyName) errs.family_name = "Nama keluarga wajib diisi.";
    if (!nik) {
      errs.head_nik = "NIK wajib diisi.";
    } else if (!/^\d{16}$/.test(nik)) {
      errs.head_nik = "NIK harus terdiri dari 16 digit angka.";
    }
    if (!headName) errs.head_name = "Nama kepala keluarga wajib diisi.";
    if (phone && !/^\d{8,15}$/.test(phone)) {
      errs.head_phone = "Nomor telepon tidak valid (8-15 digit angka).";
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
      if (isEditing && family) {
        result = await updateFamily(family.id, null, formData);
      } else {
        result = await createFamily(null, formData);
      }

      if (result?.error) {
        setToast({ message: result.error, type: "error" });
      } else {
        setToast({
          message: isEditing ? "Data keluarga berhasil diperbarui." : "Keluarga baru berhasil ditambahkan.",
          type: "success",
        });
        setTimeout(() => {
          const familyId = (result as any).familyId;
          if (familyId) {
            router.push(`/families/${familyId}`);
          } else {
            router.push(isEditing && family ? `/families/${family.id}` : "/families");
          }
          router.refresh();
        }, 1000);
      }
    });
  }

  const spouseLabel = headGender === "PEREMPUAN" ? "Nama Suami" : "Nama Istri";
  const headLabel = headGender === "PEREMPUAN" ? "Ibu (Kepala Keluarga)" : "Bapak (Kepala Keluarga)";

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
        {/* Identitas Keluarga */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Identitas Keluarga
          </h2>
          <div className="border-t border-border pt-4">
            <label className="label">Nama Keluarga *</label>
            <input
              name="family_name"
              required
              defaultValue={family?.familyName}
              placeholder="Contoh: Keluarga Mone"
              className={`input-field ${errors.family_name ? "border-danger" : ""}`}
            />
            {errors.family_name && (
              <p className="mt-1 text-xs text-danger">{errors.family_name}</p>
            )}
          </div>
        </div>

        {/* Identitas Kepala Keluarga */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Identitas Kepala Keluarga
          </h2>
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div>
              <label className="label">NIK *</label>
              <input
                name="head_nik"
                required
                maxLength={16}
                defaultValue={family?.headNik}
                placeholder="16 digit NIK"
                className={`input-field font-mono ${errors.head_nik ? "border-danger" : ""}`}
              />
              {errors.head_nik && (
                <p className="mt-1 text-xs text-danger">{errors.head_nik}</p>
              )}
            </div>
            <div>
              <label className="label">Nama Lengkap *</label>
              <input
                name="head_name"
                required
                defaultValue={family?.headName}
                placeholder="Nama Lengkap Kepala Keluarga"
                className={`input-field ${errors.head_name ? "border-danger" : ""}`}
              />
              {errors.head_name && (
                <p className="mt-1 text-xs text-danger">{errors.head_name}</p>
              )}
            </div>
            <div>
              <label className="label">Tempat Lahir</label>
              <input
                name="head_birth_place"
                defaultValue={family?.headBirthPlace || ""}
                placeholder="Tempat Lahir"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Tanggal Lahir</label>
              <input
                type="date"
                name="head_birth_date"
                defaultValue={formatDateForInput(family?.headBirthDate || null)}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label">Jenis Kelamin</label>
              <select
                name="head_gender"
                defaultValue={family?.headGender || "LAKI_LAKI"}
                onChange={(e) => setHeadGender(e.target.value as "LAKI_LAKI" | "PEREMPUAN")}
                className="input-field"
              >
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="label">Pendidikan Terakhir</label>
              <select
                name="head_education"
                defaultValue={family?.headEducation || ""}
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
                name="head_job"
                defaultValue={family?.headJob || ""}
                placeholder="Pekerjaan"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">No. Telepon</label>
              <input
                name="head_phone"
                defaultValue={family?.headPhone || ""}
                placeholder="8-15 digit angka"
                className={`input-field font-mono ${errors.head_phone ? "border-danger" : ""}`}
              />
              {errors.head_phone && (
                <p className="mt-1 text-xs text-danger">{errors.head_phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Hubungan & Alamat */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Kontak & Alamat
          </h2>
          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <label className="label">{spouseLabel}</label>
              <input
                name="wife_name"
                defaultValue={family?.wifeName || ""}
                placeholder={spouseLabel}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Alamat Rumah</label>
              <textarea
                name="home_address"
                rows={3}
                defaultValue={family?.homeAddress || ""}
                placeholder="Alamat Lengkap Rumah"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
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
            {isPending ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Keluarga"}
          </button>
        </div>
      </form>
    </div>
  );
}
