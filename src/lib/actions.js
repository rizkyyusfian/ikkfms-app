"use server";

import getDb from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── FAMILIES ───────────────────────────────────────────────

export async function getFamilies(search = "") {
  const db = getDb();
  if (search) {
    const pattern = `%${search}%`;
    return db
      .prepare(
        `
      SELECT f.*, COUNT(m.id) as member_count
      FROM families f
      LEFT JOIN members m ON m.family_id = f.id
      WHERE f.head_name LIKE ? OR f.head_nik LIKE ? OR f.family_name LIKE ?
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `,
      )
      .all(pattern, pattern, pattern);
  }
  return db
    .prepare(
      `
    SELECT f.*, COUNT(m.id) as member_count
    FROM families f
    LEFT JOIN members m ON m.family_id = f.id
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `,
    )
    .all();
}

export async function getFamiliesWithMembers(search = "") {
  const db = getDb();
  const families = await getFamilies(search);

  if (families.length === 0) return [];

  const familyIds = families.map((family) => family.id);
  const placeholders = familyIds.map(() => "?").join(",");

  const members = db
    .prepare(
      `
      SELECT *
      FROM members
      WHERE family_id IN (${placeholders})
      ORDER BY family_id ASC,
        CASE WHEN child_order IS NULL THEN 9999 ELSE child_order END ASC,
        name ASC
    `,
    )
    .all(...familyIds);

  const memberMap = new Map();
  for (const member of members) {
    if (!memberMap.has(member.family_id)) {
      memberMap.set(member.family_id, []);
    }
    memberMap.get(member.family_id).push(member);
  }

  return families.map((family) => ({
    ...family,
    members: memberMap.get(family.id) || [],
  }));
}

export async function getFamily(id) {
  const db = getDb();
  const family = db.prepare("SELECT * FROM families WHERE id = ?").get(id);
  if (!family) return null;

  const members = db
    .prepare(
      "SELECT * FROM members WHERE family_id = ? ORDER BY child_order ASC, name ASC",
    )
    .all(id);

  return { ...family, members };
}

export async function createFamily(formData) {
  const db = getDb();
  const data = {
    family_name: formData.get("family_name"),
    head_nik: formData.get("head_nik"),
    head_name: formData.get("head_name"),
    head_birth_place: formData.get("head_birth_place"),
    head_birth_date: formData.get("head_birth_date"),
    head_gender: formData.get("head_gender"),
    head_job: formData.get("head_job"),
    head_education: formData.get("head_education"),
    head_phone: formData.get("head_phone"),
    home_address: formData.get("home_address"),
    wife_name: formData.get("wife_name"),
  };

  db.prepare(
    `
    INSERT INTO families (family_name, head_nik, head_name, head_birth_place, head_birth_date,
      head_gender, head_job, head_education, head_phone, home_address, wife_name)
    VALUES (@family_name, @head_nik, @head_name, @head_birth_place, @head_birth_date,
      @head_gender, @head_job, @head_education, @head_phone, @home_address, @wife_name)
  `,
  ).run(data);

  revalidatePath("/families");
  revalidatePath("/");
}

export async function updateFamily(id, formData) {
  const db = getDb();
  const data = {
    id,
    family_name: formData.get("family_name"),
    head_nik: formData.get("head_nik"),
    head_name: formData.get("head_name"),
    head_birth_place: formData.get("head_birth_place"),
    head_birth_date: formData.get("head_birth_date"),
    head_gender: formData.get("head_gender"),
    head_job: formData.get("head_job"),
    head_education: formData.get("head_education"),
    head_phone: formData.get("head_phone"),
    home_address: formData.get("home_address"),
    wife_name: formData.get("wife_name"),
  };

  db.prepare(
    `
    UPDATE families SET
      family_name = @family_name, head_nik = @head_nik, head_name = @head_name,
      head_birth_place = @head_birth_place, head_birth_date = @head_birth_date,
      head_gender = @head_gender, head_job = @head_job, head_education = @head_education,
      head_phone = @head_phone, home_address = @home_address, wife_name = @wife_name,
      updated_at = datetime('now', 'localtime')
    WHERE id = @id
  `,
  ).run(data);

  revalidatePath("/families");
  revalidatePath(`/families/${id}`);
  revalidatePath("/");
}

export async function deleteFamily(id) {
  const db = getDb();
  db.prepare("DELETE FROM families WHERE id = ?").run(id);
  revalidatePath("/families");
  revalidatePath("/");
}

// ─── MEMBERS ────────────────────────────────────────────────

export async function getMember(id) {
  const db = getDb();
  const member = db
    .prepare(
      `
    SELECT m.*, f.family_name, f.head_name
    FROM members m
    JOIN families f ON f.id = m.family_id
    WHERE m.id = ?
  `,
    )
    .get(id);
  return member || null;
}

export async function createMember(familyId, formData) {
  const db = getDb();
  const data = {
    family_id: familyId,
    nik: formData.get("nik"),
    name: formData.get("name"),
    birth_place: formData.get("birth_place"),
    birth_date: formData.get("birth_date"),
    gender: formData.get("gender"),
    family_status: formData.get("family_status"),
    job: formData.get("job"),
    education: formData.get("education"),
    phone: formData.get("phone"),
    child_order: formData.get("child_order")
      ? Number(formData.get("child_order"))
      : null,
  };

  db.prepare(
    `
    INSERT INTO members (family_id, nik, name, birth_place, birth_date,
      gender, family_status, job, education, phone, child_order)
    VALUES (@family_id, @nik, @name, @birth_place, @birth_date,
      @gender, @family_status, @job, @education, @phone, @child_order)
  `,
  ).run(data);

  revalidatePath(`/families/${familyId}`);
  revalidatePath("/");
}

export async function updateMember(id, familyId, formData) {
  const db = getDb();
  const data = {
    id,
    nik: formData.get("nik"),
    name: formData.get("name"),
    birth_place: formData.get("birth_place"),
    birth_date: formData.get("birth_date"),
    gender: formData.get("gender"),
    family_status: formData.get("family_status"),
    job: formData.get("job"),
    education: formData.get("education"),
    phone: formData.get("phone"),
    child_order: formData.get("child_order")
      ? Number(formData.get("child_order"))
      : null,
  };

  db.prepare(
    `
    UPDATE members SET
      nik = @nik, name = @name, birth_place = @birth_place, birth_date = @birth_date,
      gender = @gender, family_status = @family_status, job = @job, education = @education,
      phone = @phone, child_order = @child_order,
      updated_at = datetime('now', 'localtime')
    WHERE id = @id
  `,
  ).run(data);

  revalidatePath(`/families/${familyId}`);
  revalidatePath("/");
}

export async function deleteMember(id, familyId) {
  const db = getDb();
  db.prepare("DELETE FROM members WHERE id = ?").run(id);
  revalidatePath(`/families/${familyId}`);
  revalidatePath("/");
}

// ─── SEARCH ─────────────────────────────────────────────────

export async function searchMembers(query) {
  if (!query) return [];
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .prepare(
      `
    SELECT m.*, f.family_name, f.head_name
    FROM members m
    JOIN families f ON f.id = m.family_id
    WHERE m.name LIKE ? OR m.nik LIKE ?
    ORDER BY m.name ASC
    LIMIT 50
  `,
    )
    .all(pattern, pattern);
}

// ─── STATS ──────────────────────────────────────────────────

export async function getStats() {
  const db = getDb();
  const familyCount = db
    .prepare("SELECT COUNT(*) as count FROM families")
    .get().count;
  const memberCount = db
    .prepare("SELECT COUNT(*) as count FROM members")
    .get().count;

  const totalPeople = familyCount + memberCount;

  const peopleByGenderRows = db
    .prepare(
      `
      SELECT gender, COUNT(*) as count
      FROM (
        SELECT COALESCE(NULLIF(head_gender, ''), 'Tidak diketahui') as gender FROM families
        UNION ALL
        SELECT COALESCE(NULLIF(gender, ''), 'Tidak diketahui') as gender FROM members
      )
      GROUP BY gender
      ORDER BY count DESC
    `,
    )
    .all();

  const educationRows = db
    .prepare(
      `
      SELECT education, COUNT(*) as count
      FROM (
        SELECT COALESCE(NULLIF(head_education, ''), 'Tidak diketahui') as education FROM families
        UNION ALL
        SELECT COALESCE(NULLIF(education, ''), 'Tidak diketahui') as education FROM members
      )
      GROUP BY education
      ORDER BY count DESC
    `,
    )
    .all();

  const familyStatusRows = db
    .prepare(
      `
      SELECT family_status as status, COUNT(*) as count
      FROM members
      GROUP BY family_status
      ORDER BY count DESC
    `,
    )
    .all();

  const recentFamilyCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM families
      WHERE datetime(created_at) >= datetime('now', '-30 day', 'localtime')
    `,
    )
    .get().count;

  const recentMemberCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM members
      WHERE datetime(created_at) >= datetime('now', '-30 day', 'localtime')
    `,
    )
    .get().count;

  const averagePeoplePerFamily =
    familyCount > 0 ? Number((totalPeople / familyCount).toFixed(2)) : 0;

  return {
    familyCount,
    memberCount,
    totalPeople,
    averagePeoplePerFamily,
    peopleByGender: peopleByGenderRows,
    educationStats: educationRows,
    familyStatusStats: familyStatusRows,
    recentFamilyCount,
    recentMemberCount,
  };
}
