import { notFound } from "next/navigation";
import { getFamily } from "@/lib/actions";
import FamilyForm from "@/components/FamilyForm";
import Link from "next/link";

export const metadata = { title: "Edit Keluarga - IKKFMS" };

export default async function EditFamilyPage({ params }) {
  const { id } = await params;
  const family = await getFamily(Number(id));

  if (!family) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/families/${id}`}
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; Kembali ke Detail
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit Keluarga
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Ubah data keluarga {family.family_name}
      </p>
      <div className="mt-6">
        <FamilyForm family={family} />
      </div>
    </div>
  );
}
