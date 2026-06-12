"use server";

import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/types";

export async function getStats(): Promise<DashboardStats> {
  // Recent creations in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    familyCount,
    memberCount,
    recentFamilyCount,
    recentMemberCount,
    familiesGenders,
    membersGenders,
    familiesEducation,
    membersEducation,
    membersStatus,
  ] = await Promise.all([
    prisma.family.count(),
    prisma.member.count(),
    prisma.family.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.member.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.family.groupBy({
      by: ['headGender'],
      _count: {
        id: true,
      },
    }),
    prisma.member.groupBy({
      by: ['gender'],
      _count: {
        id: true,
      },
    }),
    prisma.family.groupBy({
      by: ['headEducation'],
      _count: {
        id: true,
      },
    }),
    prisma.member.groupBy({
      by: ['education'],
      _count: {
        id: true,
      },
    }),
    prisma.member.groupBy({
      by: ['familyStatus'],
      _count: {
        id: true,
      },
    }),
  ]);

  const totalPeople = familyCount + memberCount;

  const averagePeoplePerFamily =
    familyCount > 0 ? Number((totalPeople / familyCount).toFixed(2)) : 0;

  const genderCounts: Record<string, number> = {
    "Laki-laki": 0,
    "Perempuan": 0,
  };

  familiesGenders.forEach(g => {
    const key = g.headGender === 'LAKI_LAKI' ? "Laki-laki" : "Perempuan";
    genderCounts[key] = (genderCounts[key] || 0) + g._count.id;
  });

  membersGenders.forEach(g => {
    if (g.gender) {
      const key = g.gender === 'LAKI_LAKI' ? "Laki-laki" : "Perempuan";
      genderCounts[key] = (genderCounts[key] || 0) + g._count.id;
    }
  });

  const peopleByGender = Object.entries(genderCounts)
    .map(([gender, count]) => ({ gender, count }))
    .sort((a, b) => b.count - a.count);

  const educationCounts: Record<string, number> = {};
  familiesEducation.forEach(e => {
    const key = e.headEducation || "Tidak diketahui";
    educationCounts[key] = (educationCounts[key] || 0) + e._count.id;
  });

  membersEducation.forEach(e => {
    const key = e.education || "Tidak diketahui";
    educationCounts[key] = (educationCounts[key] || 0) + e._count.id;
  });

  const educationStats = Object.entries(educationCounts)
    .map(([education, count]) => ({ education, count }))
    .sort((a, b) => b.count - a.count);

  const familyStatusStats = membersStatus.map(s => {
    let statusLabel = s.familyStatus as string;
    if (s.familyStatus === 'ISTRI') statusLabel = "Istri";
    else if (s.familyStatus === 'ANAK') statusLabel = "Anak";
    else if (s.familyStatus === 'CUCU') statusLabel = "Cucu";
    else if (s.familyStatus === 'MENANTU') statusLabel = "Menantu";
    else if (s.familyStatus === 'ORANG_TUA') statusLabel = "Orang Tua";
    else if (s.familyStatus === 'LAINNYA') statusLabel = "Lainnya";

    return {
      status: statusLabel,
      count: s._count.id,
    };
  }).sort((a, b) => b.count - a.count);

  return {
    familyCount,
    memberCount,
    totalPeople,
    averagePeoplePerFamily,
    peopleByGender,
    educationStats,
    familyStatusStats,
    recentFamilyCount,
    recentMemberCount,
  };
}
