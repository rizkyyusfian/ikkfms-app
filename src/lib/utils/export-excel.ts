import ExcelJS from "exceljs";
import { FamilyWithMembers } from "@/types";

export async function generateExcelBuffer(families: FamilyWithMembers[]): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Keluarga");

  // Title block
  worksheet.addRow(["IKATAN KERUKUNAN KELUARGA FETO MONE SORONG (IKKFMS)"]);
  worksheet.addRow(["SK KEMENKUMHAM RI Nomor: AHU-0009368.AH.01.07. Tahun 2024"]);
  worksheet.addRow(["Laporan Data Keluarga & Anggota"]);
  worksheet.addRow([]); // empty spacing row

  // Style Title Block
  worksheet.mergeCells("A1:J1");
  worksheet.mergeCells("A2:J2");
  worksheet.mergeCells("A3:J3");

  const titleRow = worksheet.getRow(1);
  titleRow.font = { name: "Geist Sans", size: 14, bold: true, color: { argb: "FF0F6E56" } }; // accent teal
  titleRow.alignment = { horizontal: "center" };

  const subTitleRow = worksheet.getRow(2);
  subTitleRow.font = { name: "Geist Sans", size: 10, italic: true };
  subTitleRow.alignment = { horizontal: "center" };

  const reportTitleRow = worksheet.getRow(3);
  reportTitleRow.font = { name: "Geist Sans", size: 11, bold: true };
  reportTitleRow.alignment = { horizontal: "center" };

  // Helper to format date
  const formatDate = (date: Date | null): string => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Nama Lengkap", key: "name", width: 30 },
    { header: "NIK", key: "nik", width: 22 },
    { header: "Tempat Lahir", key: "birthPlace", width: 18 },
    { header: "Tanggal Lahir", key: "birthDate", width: 16 },
    { header: "L/P", key: "gender", width: 6 },
    { header: "Status Hubungan", key: "status", width: 18 },
    { header: "Pendidikan", key: "education", width: 12 },
    { header: "Pekerjaan", key: "job", width: 18 },
    { header: "No. Telepon", key: "phone", width: 18 },
    { header: "Alamat", key: "address", width: 40 },
  ];

  worksheet.columns = columns;

  let familyIndex = 1;

  for (const family of families) {
    const totalPeople = 1 + family.members.length;

    // 1. Family header block row
    const famHeaderRow = worksheet.addRow({
      no: familyIndex,
      name: `KELUARGA: ${family.familyName.toUpperCase()} (${totalPeople} Jiwa)`,
      address: family.homeAddress || "-",
    });

    // Style family header block
    famHeaderRow.font = { name: "Geist Sans", bold: true, size: 11 };
    famHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E2DC" }, // border/surface neutral fill
    };

    worksheet.mergeCells(`B${famHeaderRow.number}:J${famHeaderRow.number}`);

    // Table Column Headers for this family block
    const tableHeaderRow = worksheet.addRow({
      no: "",
      name: "Nama Lengkap",
      nik: "NIK",
      birthPlace: "Tempat Lahir",
      birthDate: "Tanggal Lahir",
      gender: "L/P",
      status: "Hubungan",
      education: "Pendidikan",
      job: "Pekerjaan",
      phone: "Telepon",
      address: "Alamat",
    });

    tableHeaderRow.font = { name: "Geist Sans", bold: true, size: 10 };
    tableHeaderRow.alignment = { horizontal: "center" };

    // 2. Head of Household Row
    const headRow = worksheet.addRow({
      no: "",
      name: family.headName,
      nik: family.headNik,
      birthPlace: family.headBirthPlace || "-",
      birthDate: formatDate(family.headBirthDate),
      gender: family.headGender === "LAKI_LAKI" ? "L" : "P",
      status: "Kepala Keluarga",
      education: family.headEducation || "-",
      job: family.headJob || "-",
      phone: family.headPhone || "-",
      address: family.homeAddress || "-",
    });
    headRow.font = { name: "Geist Sans", size: 10 };
    // Font mono for numeric columns
    headRow.getCell("nik").font = { name: "Geist Mono", size: 10 };
    headRow.getCell("phone").font = { name: "Geist Mono", size: 10 };
    headRow.getCell("birthDate").font = { name: "Geist Mono", size: 10 };

    // 3. Family Members Rows
    // Sort members: Istri -> Anak by childOrder -> others alphabetically
    const sortedMembers = [...family.members].sort((a, b) => {
      if (a.familyStatus === "ISTRI") return -1;
      if (b.familyStatus === "ISTRI") return 1;

      if (a.familyStatus === "ANAK" && b.familyStatus === "ANAK") {
        return (a.childOrder || 99) - (b.childOrder || 99);
      }
      if (a.familyStatus === "ANAK") return -1;
      if (b.familyStatus === "ANAK") return 1;

      return a.name.localeCompare(b.name);
    });

    for (const member of sortedMembers) {
      const memberRow = worksheet.addRow({
        no: "",
        name: member.name,
        nik: member.nik,
        birthPlace: member.birthPlace || "-",
        birthDate: formatDate(member.birthDate),
        gender: member.gender === "LAKI_LAKI" ? "L" : member.gender === "PEREMPUAN" ? "P" : "-",
        status: member.familyStatus === "ISTRI" ? "Istri" : member.familyStatus === "ANAK" ? `Anak ke-${member.childOrder || ""}` : member.familyStatus,
        education: member.education || "-",
        job: member.job || "-",
        phone: member.phone || "-",
        address: family.homeAddress || "-",
      });
      memberRow.font = { name: "Geist Sans", size: 10 };
      memberRow.getCell("nik").font = { name: "Geist Mono", size: 10 };
      memberRow.getCell("phone").font = { name: "Geist Mono", size: 10 };
      memberRow.getCell("birthDate").font = { name: "Geist Mono", size: 10 };
    }

    // Add empty spacing row between families
    worksheet.addRow([]);
    familyIndex++;
  }

  // Adjust columns alignment
  worksheet.eachRow((row) => {
    row.alignment = { vertical: "middle", ...row.alignment };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
