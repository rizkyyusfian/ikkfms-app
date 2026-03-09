import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember } from "@/lib/actions";
import MemberForm from "@/components/MemberForm";

export const metadata = { title: "Edit Anggota - IKKFMS" };

export default async function EditMemberPage({ params }) {
  const { id, memberId } = await params;
  const member = await getMember(Number(memberId));

  if (!member) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/families/${id}`}
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; Kembali ke Detail Keluarga
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit Anggota
      </h1>
      <p className="mt-1 text-sm text-zinc-500">Ubah data {member.name}</p>
      <div className="mt-6">
        <MemberForm familyId={Number(id)} member={member} />
      </div>
    </div>
  );
}
