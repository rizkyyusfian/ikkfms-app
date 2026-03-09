"use client";

import { useRouter } from "next/navigation";
import { createMember, updateMember } from "@/lib/actions";

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

const STATUS_OPTIONS = [
  "Istri",
  "Anak",
  "Cucu",
  "Menantu",
  "Orang Tua",
  "Lainnya",
];

export default function MemberForm({ familyId, member = null }) {
  const router = useRouter();
  const isEditing = !!member;

  async function handleSubmit(formData) {
    if (isEditing) {
      await updateMember(member.id, familyId, formData);
    } else {
      await createMember(familyId, formData);
    }
    router.push(`/families/${familyId}`);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">NIK *</label>
          <input
            name="nik"
            required
            maxLength={16}
            defaultValue={member?.nik}
            placeholder="16 digit NIK"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Nama Lengkap *</label>
          <input
            name="name"
            required
            defaultValue={member?.name}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Tempat Lahir</label>
          <input
            name="birth_place"
            defaultValue={member?.birth_place}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Tanggal Lahir</label>
          <input
            type="date"
            name="birth_date"
            defaultValue={member?.birth_date}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Jenis Kelamin</label>
          <select
            name="gender"
            defaultValue={member?.gender || "Laki-laki"}
            className="input-field"
          >
            <option>Laki-laki</option>
            <option>Perempuan</option>
          </select>
        </div>
        <div>
          <label className="label">Status Keluarga *</label>
          <select
            name="family_status"
            required
            defaultValue={member?.family_status || "Anak"}
            className="input-field"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Pekerjaan</label>
          <input
            name="job"
            defaultValue={member?.job}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Pendidikan Terakhir</label>
          <select
            name="education"
            defaultValue={member?.education || ""}
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
            name="phone"
            defaultValue={member?.phone}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Urutan Anak (jika anak)</label>
          <input
            type="number"
            name="child_order"
            min={1}
            max={20}
            defaultValue={member?.child_order}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary">
          {isEditing ? "Simpan Perubahan" : "Tambah Anggota"}
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
