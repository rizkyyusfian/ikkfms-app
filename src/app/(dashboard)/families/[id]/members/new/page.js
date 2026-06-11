import Link from "next/link";
import { notFound } from "next/navigation";
import { getFamily } from "@/lib/actions";
import MemberForm from "@/components/MemberForm";

export const metadata = { title: "Tambah Anggota - IKKFMS" };

export default async function NewMemberPage({ params }) {
  const { id } = await params;
  const family = await getFamily(Number(id));

  if (!family) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/families/${id}`}
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; Kembali ke {family.family_name}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Tambah Anggota Keluarga
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Tambahkan anggota baru ke keluarga {family.family_name}
      </p>
      <div className="mt-6">
        <MemberForm familyId={family.id} />
      </div>
    </div>
  );
}
