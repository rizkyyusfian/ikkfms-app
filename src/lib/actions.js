"use server";

import getDb from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

// ─── AUTHENTICATION ACTIONS ───────────────────────────────────

export async function loginAction(prevState, formData) {
  try {
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!username || !password) {
      return { error: "Username dan password wajib diisi." };
    }

    const db = getDb();
    const userRes = await db.query(
      "SELECT * FROM users WHERE username = $1 LIMIT 1",
      [username]
    );

    const user = userRes.rows[0];
    if (!user) {
      return { error: "Username atau password salah." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { error: "Username atau password salah." };
    }

    await setSessionCookie(username);
    // Success redirect is handled by router or page reload
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan sistem. Silakan coba lagi." };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

// ─── FAMILIES ───────────────────────────────────────────────

export async function getFamilies(search = "") {
  const db = getDb();
  if (search) {
    const pattern = `%${search}%`;
    const res = await db.query(
      `
      SELECT f.*, COUNT(m.id)::int as member_count
      FROM families f
      LEFT JOIN members m ON m.family_id = f.id
      WHERE f.head_name ILIKE $1 OR f.head_nik ILIKE $2 OR f.family_name ILIKE $3
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `,
      [pattern, pattern, pattern]
    );
    return res.rows;
  }
  const res = await db.query(
    `
    SELECT f.*, COUNT(m.id)::int as member_count
    FROM families f
    LEFT JOIN members m ON m.family_id = f.id
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `
  );
  return res.rows;
}

export async function getFamiliesWithMembers(search = "") {
  const db = getDb();
  const families = await getFamilies(search);

  if (families.length === 0) return [];

  const familyIds = families.map((family) => family.id);
  const res = await db.query(
    `
    SELECT *
    FROM members
    WHERE family_id = ANY($1::int[])
    ORDER BY family_id ASC,
      CASE WHEN child_order IS NULL THEN 9999 ELSE child_order END ASC,
      name ASC
    `,
    [familyIds]
  );
  const members = res.rows;

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
  const familyRes = await db.query("SELECT * FROM families WHERE id = $1", [id]);
  const family = familyRes.rows[0];
  if (!family) return null;

  const membersRes = await db.query(
    "SELECT * FROM members WHERE family_id = $1 ORDER BY child_order ASC, name ASC",
    [id]
  );

  return { ...family, members: membersRes.rows };
}

export async function createFamily(formData) {
  const db = getDb();
  await db.query(
    `
    INSERT INTO families (
      family_name, head_nik, head_name, head_birth_place, head_birth_date,
      head_gender, head_job, head_education, head_phone, home_address, wife_name
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `,
    [
      formData.get("family_name"),
      formData.get("head_nik"),
      formData.get("head_name"),
      formData.get("head_birth_place"),
      formData.get("head_birth_date") || null,
      formData.get("head_gender"),
      formData.get("head_job"),
      formData.get("head_education"),
      formData.get("head_phone"),
      formData.get("home_address"),
      formData.get("wife_name"),
    ]
  );

  revalidatePath("/families");
  revalidatePath("/");
}

export async function updateFamily(id, formData) {
  const db = getDb();
  await db.query(
    `
    UPDATE families SET
      family_name = $1, head_nik = $2, head_name = $3,
      head_birth_place = $4, head_birth_date = $5,
      head_gender = $6, head_job = $7, head_education = $8,
      head_phone = $9, home_address = $10, wife_name = $11,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $12
  `,
    [
      formData.get("family_name"),
      formData.get("head_nik"),
      formData.get("head_name"),
      formData.get("head_birth_place"),
      formData.get("head_birth_date") || null,
      formData.get("head_gender"),
      formData.get("head_job"),
      formData.get("head_education"),
      formData.get("head_phone"),
      formData.get("home_address"),
      formData.get("wife_name"),
      id,
    ]
  );

  revalidatePath("/families");
  revalidatePath(`/families/${id}`);
  revalidatePath("/");
}

export async function deleteFamily(id) {
  const db = getDb();
  await db.query("DELETE FROM families WHERE id = $1", [id]);
  revalidatePath("/families");
  revalidatePath("/");
}

// ─── MEMBERS ────────────────────────────────────────────────

export async function getMember(id) {
  const db = getDb();
  const res = await db.query(
    `
    SELECT m.*, f.family_name, f.head_name
    FROM members m
    JOIN families f ON f.id = m.family_id
    WHERE m.id = $1
  `,
    [id]
  );
  return res.rows[0] || null;
}

export async function createMember(familyId, formData) {
  const db = getDb();
  await db.query(
    `
    INSERT INTO members (
      family_id, nik, name, birth_place, birth_date,
      gender, family_status, job, education, phone, child_order
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `,
    [
      familyId,
      formData.get("nik"),
      formData.get("name"),
      formData.get("birth_place"),
      formData.get("birth_date") || null,
      formData.get("gender"),
      formData.get("family_status"),
      formData.get("job"),
      formData.get("education"),
      formData.get("phone"),
      formData.get("child_order") ? Number(formData.get("child_order")) : null,
    ]
  );

  revalidatePath(`/families/${familyId}`);
  revalidatePath("/");
}

export async function updateMember(id, familyId, formData) {
  const db = getDb();
  await db.query(
    `
    UPDATE members SET
      nik = $1, name = $2, birth_place = $3, birth_date = $4,
      gender = $5, family_status = $6, job = $7, education = $8,
      phone = $9, child_order = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
  `,
    [
      formData.get("nik"),
      formData.get("name"),
      formData.get("birth_place"),
      formData.get("birth_date") || null,
      formData.get("gender"),
      formData.get("family_status"),
      formData.get("job"),
      formData.get("education"),
      formData.get("phone"),
      formData.get("child_order") ? Number(formData.get("child_order")) : null,
      id,
    ]
  );

  revalidatePath(`/families/${familyId}`);
  revalidatePath("/");
}

export async function deleteMember(id, familyId) {
  const db = getDb();
  await db.query("DELETE FROM members WHERE id = $1", [id]);
  revalidatePath(`/families/${familyId}`);
  revalidatePath("/");
}

// ─── SEARCH ─────────────────────────────────────────────────

export async function searchMembers(query) {
  if (!query) return [];
  const db = getDb();
  const pattern = `%${query}%`;
  const res = await db.query(
    `
    SELECT m.*, f.family_name, f.head_name
    FROM members m
    JOIN families f ON f.id = m.family_id
    WHERE m.name ILIKE $1 OR m.nik ILIKE $2
    ORDER BY m.name ASC
    LIMIT 50
  `,
    [pattern, pattern]
  );
  return res.rows;
}

// ─── STATS ──────────────────────────────────────────────────

export async function getStats() {
  const db = getDb();

  const familyCountRes = await db.query(
    "SELECT COUNT(*)::int as count FROM families"
  );
  const familyCount = familyCountRes.rows[0].count;

  const memberCountRes = await db.query(
    "SELECT COUNT(*)::int as count FROM members"
  );
  const memberCount = memberCountRes.rows[0].count;

  const totalPeople = familyCount + memberCount;

  const genderRes = await db.query(`
    SELECT COALESCE(NULLIF(gender, ''), 'Tidak diketahui') as gender, COUNT(*)::int as count
    FROM (
      SELECT head_gender as gender FROM families
      UNION ALL
      SELECT gender FROM members
    ) sub
    GROUP BY gender
    ORDER BY count DESC
  `);

  const educationRes = await db.query(`
    SELECT COALESCE(NULLIF(education, ''), 'Tidak diketahui') as education, COUNT(*)::int as count
    FROM (
      SELECT head_education as education FROM families
      UNION ALL
      SELECT education FROM members
    ) sub
    GROUP BY education
    ORDER BY count DESC
  `);

  const statusRes = await db.query(`
    SELECT family_status as status, COUNT(*)::int as count
    FROM members
    GROUP BY family_status
    ORDER BY count DESC
  `);

  const recentFamiliesRes = await db.query(`
    SELECT COUNT(*)::int as count
    FROM families
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);
  const recentFamilyCount = recentFamiliesRes.rows[0].count;

  const recentMembersRes = await db.query(`
    SELECT COUNT(*)::int as count
    FROM members
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);
  const recentMemberCount = recentMembersRes.rows[0].count;

  const averagePeoplePerFamily =
    familyCount > 0 ? Number((totalPeople / familyCount).toFixed(2)) : 0;

  return {
    familyCount,
    memberCount,
    totalPeople,
    averagePeoplePerFamily,
    peopleByGender: genderRes.rows,
    educationStats: educationRes.rows,
    familyStatusStats: statusRes.rows,
    recentFamilyCount,
    recentMemberCount,
  };
}
