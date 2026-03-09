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
}

export async function deleteFamily(id) {
  const db = getDb();
  db.prepare("DELETE FROM families WHERE id = ?").run(id);
  revalidatePath("/families");
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
}

export async function deleteMember(id, familyId) {
  const db = getDb();
  db.prepare("DELETE FROM members WHERE id = ?").run(id);
  revalidatePath(`/families/${familyId}`);
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
  return { familyCount, memberCount };
}
