import { Family, Member } from "@prisma/client";

export type FamilyWithMembers = Family & {
  members: Member[];
};

export type DashboardStats = {
  familyCount: number;
  memberCount: number;
  totalPeople: number;
  averagePeoplePerFamily: number;
  peopleByGender: { gender: string; count: number }[];
  educationStats: { education: string; count: number }[];
  familyStatusStats: { status: string; count: number }[];
  recentFamilyCount: number;
  recentMemberCount: number;
};
