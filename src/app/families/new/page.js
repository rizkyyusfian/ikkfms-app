import FamilyForm from "@/components/FamilyForm";

export const metadata = { title: "Tambah Keluarga - IKKFMS" };

export default function NewFamilyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Tambah Keluarga Baru
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Isi data kepala keluarga dan informasi keluarga
      </p>
      <div className="mt-6">
        <FamilyForm />
      </div>
    </div>
  );
}
