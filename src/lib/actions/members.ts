"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Gender, Education, FamilyStatus } from "@prisma/client";

// Helper for validating NIK
function validateNik(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

// Helper for validating Phone
function validatePhone(phone: string | null): boolean {
  if (!phone || phone.trim() === "") return true;
  return /^\d{8,15}$/.test(phone.trim());
}

export async function getMember(id: number) {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      family: {
        select: {
          familyName: true,
          headName: true,
        },
      },
    },
  });

  if (!member) return null;

  return {
    ...member,
    family_name: member.family.familyName,
    head_name: member.family.headName,
  };
}

export async function createMember(familyId: number, prevState: any, formData: FormData) {
  const nik = formData.get("nik")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const birthPlace = formData.get("birth_place")?.toString().trim() || null;
  const birthDateStr = formData.get("birth_date")?.toString();
  const gender = (formData.get("gender")?.toString() || null) as Gender | null;
  const familyStatus = (formData.get("family_status")?.toString() || "ANAK") as FamilyStatus;
  const job = formData.get("job")?.toString().trim() || null;
  const education = (formData.get("education")?.toString() || null) as Education | null;
  const phone = formData.get("phone")?.toString().trim() || null;
  const childOrderStr = formData.get("child_order")?.toString().trim();

  if (!nik || !name || !familyStatus) {
    return { error: "NIK, Nama Lengkap, dan Status Hubungan wajib diisi." };
  }

  if (!validateNik(nik)) {
    return { error: "NIK harus tepat 16 digit angka." };
  }

  if (!validatePhone(phone)) {
    return { error: "Nomor telepon harus terdiri dari 8 hingga 15 digit angka." };
  }

  let childOrder: number | null = null;
  if (familyStatus === "ANAK") {
    if (!childOrderStr || isNaN(Number(childOrderStr))) {
      return { error: "Urutan anak wajib diisi untuk status hubungan Anak." };
    }
    childOrder = Number(childOrderStr);
  }

  try {
    const birthDate = birthDateStr ? new Date(birthDateStr) : null;
    await prisma.member.create({
      data: {
        familyId,
        nik,
        name,
        birthPlace,
        birthDate,
        gender,
        familyStatus,
        job,
        education,
        phone,
        childOrder,
      },
    });

    revalidatePath(`/families/${familyId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Create member error:", error);
    return { error: "Gagal menambahkan anggota keluarga. Silakan coba lagi." };
  }
}

export async function updateMember(id: number, familyId: number, prevState: any, formData: FormData) {
  const nik = formData.get("nik")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const birthPlace = formData.get("birth_place")?.toString().trim() || null;
  const birthDateStr = formData.get("birth_date")?.toString();
  const gender = (formData.get("gender")?.toString() || null) as Gender | null;
  const familyStatus = (formData.get("family_status")?.toString() || "ANAK") as FamilyStatus;
  const job = formData.get("job")?.toString().trim() || null;
  const education = (formData.get("education")?.toString() || null) as Education | null;
  const phone = formData.get("phone")?.toString().trim() || null;
  const childOrderStr = formData.get("child_order")?.toString().trim();

  if (!nik || !name || !familyStatus) {
    return { error: "NIK, Nama Lengkap, dan Status Hubungan wajib diisi." };
  }

  if (!validateNik(nik)) {
    return { error: "NIK harus tepat 16 digit angka." };
  }

  if (!validatePhone(phone)) {
    return { error: "Nomor telepon harus terdiri dari 8 hingga 15 digit angka." };
  }

  let childOrder: number | null = null;
  if (familyStatus === "ANAK") {
    if (!childOrderStr || isNaN(Number(childOrderStr))) {
      return { error: "Urutan anak wajib diisi untuk status hubungan Anak." };
    }
    childOrder = Number(childOrderStr);
  }

  try {
    const birthDate = birthDateStr ? new Date(birthDateStr) : null;
    await prisma.member.update({
      where: { id },
      data: {
        nik,
        name,
        birthPlace,
        birthDate,
        gender,
        familyStatus,
        job,
        education,
        phone,
        childOrder,
      },
    });

    revalidatePath(`/families/${familyId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Update member error:", error);
    return { error: "Gagal memperbarui data anggota keluarga. Silakan coba lagi." };
  }
}

export async function deleteMember(id: number, familyId: number) {
  try {
    await prisma.member.delete({
      where: { id },
    });
    revalidatePath(`/families/${familyId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete member error:", error);
    return { error: "Gagal menghapus data anggota." };
  }
}

export async function searchMembers(query: string) {
  if (!query) return [];

  const matchedMembers = await prisma.member.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { nik: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      family: {
        select: {
          familyName: true,
          headName: true,
        },
      },
    },
    take: 50,
    orderBy: {
      name: "asc",
    },
  });

  const matchedHeads = await prisma.family.findMany({
    where: {
      OR: [
        { headName: { contains: query, mode: "insensitive" } },
        { headNik: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 50,
    orderBy: {
      headName: "asc",
    },
  });

  const membersResult = matchedMembers.map((m) => ({
    id: m.id,
    familyId: m.familyId,
    nik: m.nik,
    name: m.name,
    family_status: m.familyStatus === "ISTRI" ? "Istri" : m.familyStatus === "ANAK" ? `Anak ke-${m.childOrder || ""}` : m.familyStatus,
    family_name: m.family.familyName,
    head_name: m.family.headName,
  }));

  const headsResult = matchedHeads.map((f) => ({
    id: f.id,
    familyId: f.id,
    nik: f.headNik,
    name: f.headName,
    family_status: "Kepala Keluarga",
    family_name: f.familyName,
    head_name: f.headName,
  }));

  const results = [...headsResult, ...membersResult];
  return results.slice(0, 50).sort((a, b) => a.name.localeCompare(b.name));
}
