"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFamily, updateFamily } from "@/lib/actions";

const EDUCATION_OPTIONS = [
  "Belum Sekolah",
  "SD",
  "SMP",
  "SMA/SMK",
  "D1",
  "D2",
  "D3",
  "S1",
  "S2",
  "S3",
];

export default function FamilyForm({ family = null }) {
  const router = useRouter();
  const isEditing = !!family;
  const [errors, setErrors] = useState({});
  const [headGender, setHeadGender] = useState(
    family?.head_gender || "Laki-laki",
  );

  function validate(formData) {
    const errs = {};
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
    if (phone && !/^[\d+\-\s]{8,15}$/.test(phone)) {
      errs.head_phone = "Nomor telepon tidak valid (8-15 digit).";
    }
    return errs;
  }

  async function handleSubmit(formData) {
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    if (isEditing) {
      await updateFamily(family.id, formData);
    } else {
      await createFamily(formData);
    }
    router.push("/families");
  }

  const headRoleText = headGender === "Perempuan" ? "Istri" : "Suami";
  const spouseLabel = headGender === "Perempuan" ? "Nama Suami" : "Nama Istri";

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Family Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Nama Keluarga *
        </label>
        <input
          name="family_name"
          required
          defaultValue={family?.family_name}
          placeholder="Contoh: Keluarga Mone"
          className={`input-field ${errors.family_name ? "border-red-500!" : ""}`}
        />
        {errors.family_name && (
          <p className="mt-1 text-xs text-red-500">{errors.family_name}</p>
        )}
      </div>

      <fieldset className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Data Kepala Keluarga ({headRoleText})
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">NIK *</label>
            <input
              name="head_nik"
              required
              maxLength={16}
              defaultValue={family?.head_nik}
              placeholder="16 digit NIK"
              className={`input-field ${errors.head_nik ? "border-red-500!" : ""}`}
            />
            {errors.head_nik && (
              <p className="mt-1 text-xs text-red-500">{errors.head_nik}</p>
            )}
          </div>
          <div>
            <label className="label">Nama Lengkap *</label>
            <input
              name="head_name"
              required
              defaultValue={family?.head_name}
              className={`input-field ${errors.head_name ? "border-red-500!" : ""}`}
            />
            {errors.head_name && (
              <p className="mt-1 text-xs text-red-500">{errors.head_name}</p>
            )}
          </div>
          <div>
            <label className="label">Tempat Lahir</label>
            <input
              name="head_birth_place"
              defaultValue={family?.head_birth_place}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Tanggal Lahir</label>
            <input
              type="date"
              name="head_birth_date"
              defaultValue={family?.head_birth_date}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Jenis Kelamin</label>
            <select
              name="head_gender"
              defaultValue={family?.head_gender || "Laki-laki"}
              onChange={(e) => setHeadGender(e.target.value)}
              className="input-field"
            >
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>
          <div>
            <label className="label">Pekerjaan</label>
            <input
              name="head_job"
              defaultValue={family?.head_job}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Pendidikan Terakhir</label>
            <select
              name="head_education"
              defaultValue={family?.head_education || ""}
              className="input-field"
            >
              <option value="">-- Pilih --</option>
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Telepon / HP</label>
            <input
              name="head_phone"
              defaultValue={family?.head_phone}
              className={`input-field ${errors.head_phone ? "border-red-500!" : ""}`}
            />
            {errors.head_phone && (
              <p className="mt-1 text-xs text-red-500">{errors.head_phone}</p>
            )}
          </div>
        </div>
      </fieldset>

      <div>
        <label className="label">{spouseLabel}</label>
        <input
          name="wife_name"
          defaultValue={family?.wife_name}
          placeholder={spouseLabel}
          className="input-field"
        />
      </div>

      <div>
        <label className="label">Alamat Rumah</label>
        <textarea
          name="home_address"
          rows={3}
          defaultValue={family?.home_address}
          className="input-field"
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          {isEditing ? "Simpan Perubahan" : "Tambah Keluarga"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
