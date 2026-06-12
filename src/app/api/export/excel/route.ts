import { auth } from "@/lib/auth";
import { getFamiliesWithMembers, getFamily } from "@/lib/actions/families";
import { generateExcelBuffer } from "@/lib/utils/export-excel";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const familyIdStr = searchParams.get("familyId");

  try {
    let families = [];
    if (familyIdStr) {
      const family = await getFamily(Number(familyIdStr));
      if (!family) {
        return new Response("Family not found", { status: 404 });
      }
      families = [family];
    } else {
      families = await getFamiliesWithMembers();
    }

    const buffer = await generateExcelBuffer(families);

    const filename = familyIdStr && families[0]
      ? `Data_Keluarga_${families[0].familyName.replace(/\s+/g, "_")}_IKKFMS.xlsx`
      : "Data_Keluarga_Anggota_IKKFMS.xlsx";

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
