import fs from "fs";
import path from "path";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FamilyWithMembers } from "@/types";

export async function generatePdfBuffer(families: FamilyWithMembers[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Load logo
  let logoBase64 = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "logo_ikkfms.jpeg");
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Failed to read logo image", err);
  }

  // Draw Kop Surat
  const headerLines = [
    { text: "BADAN PENGURUS", size: 10, y: 13 },
    { text: "IKATAN KERUKUNAN KELUARGA FETO MONE SORONG", size: 12, y: 18 },
    { text: "(IKKFMS)", size: 10, y: 23 },
    { text: "Keputusan Menteri Hukum dan Hak Asasi Manusia Republik Indonesia", size: 9, y: 28 },
    { text: "Nomor: AHU-0009368.AH.01.07. Tahun 2024", size: 9, y: 32 },
  ];

  doc.setFont("helvetica", "bold");
  const textBlockWidth = Math.max(
    ...headerLines.map((line) => {
      doc.setFontSize(line.size);
      return doc.getTextWidth(line.text);
    })
  );

  const logoWidth = logoBase64 ? 20 : 0;
  const logoHeight = logoBase64 ? 20 : 0;
  const logoGap = logoBase64 ? 6 : 0;
  const groupWidth = logoWidth + logoGap + textBlockWidth;
  const groupStartX = pageWidth / 2 - groupWidth / 2;
  const textCenterX = groupStartX + logoWidth + logoGap + textBlockWidth / 2;

  if (logoBase64) {
    doc.addImage(logoBase64, "JPEG", groupStartX, 12, logoWidth, logoHeight);
  }

  headerLines.forEach((line) => {
    doc.setFontSize(line.size);
    doc.text(line.text, textCenterX, line.y, { align: "center" });
  });

  // Draw Tais strip
  const taisY = 36;
  const taisHeight = 2;
  const blockWidth = 6;
  const startX = 14;
  const endX = pageWidth - 14;
  const taisWidth = endX - startX;
  const numBlocks = Math.floor(taisWidth / blockWidth);

  for (let i = 0; i < numBlocks; i++) {
    const isTeal = i % 2 === 0;
    if (isTeal) {
      doc.setFillColor(135, 182, 171); // Teal with reduced opacity (visual representation)
    } else {
      doc.setFillColor(218, 169, 132); // Amber with reduced opacity
    }
    doc.rect(startX + i * blockWidth, taisY, blockWidth, taisHeight, "F");
  }

  // Date and title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Diekspor: ${new Date().toLocaleDateString("id-ID")}`, 14, 43);

  // Table setup
  const head = [
    [
      "No",
      "Nama Keluarga",
      "Peran",
      "NIK",
      "Nama Lengkap",
      "L/P",
      "Status",
      "Tempat, Tanggal Lahir",
      "Pendidikan",
      "Pekerjaan",
    ],
  ];

  const body: any[] = [];
  let familyNumber = 1;

  for (const family of families) {
    const totalPeople = 1 + family.members.length;
    body.push([
      {
        content: `Keluarga ${familyNumber}: ${family.familyName} (${totalPeople} jiwa) - ${family.homeAddress || "-"}`,
        colSpan: 10,
        styles: {
          fillColor: [229, 226, 220],
          textColor: [28, 27, 26],
          fontStyle: "bold",
          fontSize: 8,
        },
      },
    ]);

    const formatDate = (date: Date | null): string => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Head of Family Row
    body.push([
      familyNumber,
      family.familyName,
      "Kepala Keluarga",
      family.headNik,
      family.headName,
      family.headGender === "LAKI_LAKI" ? "L" : "P",
      "Kepala Keluarga",
      `${family.headBirthPlace || "-"}, ${formatDate(family.headBirthDate)}`,
      family.headEducation || "-",
      family.headJob || "-",
    ]);

    // Sort members
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
      body.push([
        familyNumber,
        family.familyName,
        "Anggota",
        member.nik,
        member.name,
        member.gender === "LAKI_LAKI" ? "L" : member.gender === "PEREMPUAN" ? "P" : "-",
        member.familyStatus === "ISTRI" ? "Istri" : member.familyStatus === "ANAK" ? `Anak ke-${member.childOrder || ""}` : member.familyStatus,
        `${member.birthPlace || "-"}, ${formatDate(member.birthDate)}`,
        member.education || "-",
        member.job || "-",
      ]);
    }

    familyNumber++;
  }

  const tableWidth = 269;
  autoTable(doc, {
    head,
    body,
    startY: 46,
    tableWidth,
    margin: { left: 14, right: 14, top: 46 },
    styles: { fontSize: 7, cellPadding: 1.5, font: "helvetica" },
    headStyles: { fillColor: [15, 110, 86] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 28 },
      2: { cellWidth: 22 },
      3: { cellWidth: 28 },
      4: { cellWidth: 32 },
      5: { cellWidth: 8 },
      6: { cellWidth: 20 },
      7: { cellWidth: 43 },
      8: { cellWidth: 20 },
      9: { cellWidth: 20 },
    },
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return buffer;
}
