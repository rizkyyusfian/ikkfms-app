"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Gender, Education } from "@prisma/client";
import { FamilyWithMembers } from "@/types";
import { cache } from "react";

// Helper for validating NIK
function validateNik(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

// Helper for validating Phone
function validatePhone(phone: string | null): boolean {
  if (!phone || phone.trim() === "") return true;
  return /^\d{8,15}$/.test(phone.trim());
}

export async function getFamilies(search = "", page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const whereClause = search
    ? {
        OR: [
          { familyName: { contains: search, mode: "insensitive" as const } },
          { headName: { contains: search, mode: "insensitive" as const } },
          { headNik: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const totalCount = await prisma.family.count({
    where: whereClause,
  });

  const families = await prisma.family.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    families: families.map((f) => ({
      ...f,
      member_count: f._count.members,
    })),
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export async function getFamiliesWithMembers(search = ""): Promise<FamilyWithMembers[]> {
  const families = await prisma.family.findMany({
    where: search
      ? {
          OR: [
            { familyName: { contains: search, mode: "insensitive" as const } },
            { headName: { contains: search, mode: "insensitive" as const } },
            { headNik: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined,
    include: {
      members: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return families;
}

export const getFamily = cache(async (id: number): Promise<FamilyWithMembers | null> => {
  const family = await prisma.family.findUnique({
    where: { id },
    include: {
      members: true,
    },
  });

  return family;
});

export async function createFamily(prevState: any, formData: FormData) {
  const familyName = formData.get("family_name")?.toString().trim();
  const headNik = formData.get("head_nik")?.toString().trim();
  const headName = formData.get("head_name")?.toString().trim();
  const headBirthPlace = formData.get("head_birth_place")?.toString().trim() || null;
  const headBirthDateStr = formData.get("head_birth_date")?.toString();
  const headGender = (formData.get("head_gender")?.toString() || "LAKI_LAKI") as Gender;
  const headJob = formData.get("head_job")?.toString().trim() || null;
  const headEducation = (formData.get("head_education")?.toString() || null) as Education | null;
  const headPhone = formData.get("head_phone")?.toString().trim() || null;
  const homeAddress = formData.get("home_address")?.toString().trim() || null;
  const wifeName = formData.get("wife_name")?.toString().trim() || null;

  if (!familyName || !headNik || !headName) {
    return { error: "Nama Keluarga, NIK Kepala Keluarga, dan Nama Kepala Keluarga wajib diisi." };
  }

  if (!validateNik(headNik)) {
    return { error: "NIK Kepala Keluarga harus tepat 16 digit angka." };
  }

  if (!validatePhone(headPhone)) {
    return { error: "Nomor telepon harus terdiri dari 8 hingga 15 digit angka." };
  }

  // Check unique headNik
  const existing = await prisma.family.findUnique({
    where: { headNik },
  });
  if (existing) {
    return { error: "NIK Kepala Keluarga sudah terdaftar." };
  }

  try {
    const headBirthDate = headBirthDateStr ? new Date(headBirthDateStr) : null;
    const newFamily = await prisma.family.create({
      data: {
        familyName,
        headNik,
        headName,
        headBirthPlace,
        headBirthDate,
        headGender,
        headJob,
        headEducation,
        headPhone,
        homeAddress,
        wifeName,
      },
    });

    revalidatePath("/families");
    revalidatePath("/");
    return { success: true, familyId: newFamily.id };
  } catch (error: any) {
    console.error("Create family error:", error);
    return { error: "Gagal menyimpan data keluarga. Silakan coba lagi." };
  }
}

export async function updateFamily(id: number, prevState: any, formData: FormData) {
  const familyName = formData.get("family_name")?.toString().trim();
  const headNik = formData.get("head_nik")?.toString().trim();
  const headName = formData.get("head_name")?.toString().trim();
  const headBirthPlace = formData.get("head_birth_place")?.toString().trim() || null;
  const headBirthDateStr = formData.get("head_birth_date")?.toString();
  const headGender = (formData.get("head_gender")?.toString() || "LAKI_LAKI") as Gender;
  const headJob = formData.get("head_job")?.toString().trim() || null;
  const headEducation = (formData.get("head_education")?.toString() || null) as Education | null;
  const headPhone = formData.get("head_phone")?.toString().trim() || null;
  const homeAddress = formData.get("home_address")?.toString().trim() || null;
  const wifeName = formData.get("wife_name")?.toString().trim() || null;

  if (!familyName || !headNik || !headName) {
    return { error: "Nama Keluarga, NIK Kepala Keluarga, dan Nama Kepala Keluarga wajib diisi." };
  }

  if (!validateNik(headNik)) {
    return { error: "NIK Kepala Keluarga harus tepat 16 digit angka." };
  }

  if (!validatePhone(headPhone)) {
    return { error: "Nomor telepon harus terdiri dari 8 hingga 15 digit angka." };
  }

  // Check unique headNik excluding current family
  const existing = await prisma.family.findFirst({
    where: {
      headNik,
      NOT: { id },
    },
  });
  if (existing) {
    return { error: "NIK Kepala Keluarga sudah digunakan oleh keluarga lain." };
  }

  try {
    const headBirthDate = headBirthDateStr ? new Date(headBirthDateStr) : null;
    await prisma.family.update({
      where: { id },
      data: {
        familyName,
        headNik,
        headName,
        headBirthPlace,
        headBirthDate,
        headGender,
        headJob,
        headEducation,
        headPhone,
        homeAddress,
        wifeName,
      },
    });

    revalidatePath("/families");
    revalidatePath(`/families/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Update family error:", error);
    return { error: "Gagal memperbarui data keluarga. Silakan coba lagi." };
  }
}

export async function deleteFamily(id: number) {
  try {
    await prisma.family.delete({
      where: { id },
    });
    revalidatePath("/families");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete family error:", error);
    return { error: "Gagal menghapus data keluarga." };
  }
}
