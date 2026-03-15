"use client";

import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

async function getImageDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load logo image");
  }
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ExportButtons({ families, fileNamePrefix }) {
  const safePrefix = (fileNamePrefix || "Data_Keluarga_Anggota_IKKFMS")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function buildGroupedRows() {
    const rows = [];
    let familyNumber = 1;

    for (const family of families) {
      const totalPeople = 1 + (family.members?.length || 0);

      rows.push({
        "No Keluarga": familyNumber,
        "Nama Keluarga": family.family_name,
        Peran: `KELUARGA (${totalPeople} jiwa)`,
        NIK: "",
        Nama: "",
        "L/P": "",
        Status: "",
        "Tempat Lahir": "",
        "Tanggal Lahir": "",
        Pendidikan: "",
        Pekerjaan: "",
        Telepon: "",
        Alamat: family.home_address || "-",
      });

      rows.push({
        "No Keluarga": familyNumber,
        "Nama Keluarga": family.family_name,
        Peran: "Kepala Keluarga",
        NIK: family.head_nik || "-",
        Nama: family.head_name || "-",
        "L/P":
          family.head_gender === "Laki-laki"
            ? "L"
            : family.head_gender === "Perempuan"
              ? "P"
              : "-",
        Status: "Kepala Keluarga",
        "Tempat Lahir": family.head_birth_place || "-",
        "Tanggal Lahir": formatDate(family.head_birth_date),
        Pendidikan: family.head_education || "-",
        Pekerjaan: family.head_job || "-",
        Telepon: family.head_phone || "-",
        Alamat: family.home_address || "-",
      });

      (family.members || []).forEach((member) => {
        rows.push({
          "No Keluarga": familyNumber,
          "Nama Keluarga": family.family_name,
          Peran: "Anggota",
          NIK: member.nik || "-",
          Nama: member.name || "-",
          "L/P":
            member.gender === "Laki-laki"
              ? "L"
              : member.gender === "Perempuan"
                ? "P"
                : "-",
          Status: member.family_status || "-",
          "Tempat Lahir": member.birth_place || "-",
          "Tanggal Lahir": formatDate(member.birth_date),
          Pendidikan: member.education || "-",
          Pekerjaan: member.job || "-",
          Telepon: member.phone || "-",
          Alamat: family.home_address || "-",
        });
      });

      rows.push({
        "No Keluarga": "",
        "Nama Keluarga": "",
        Peran: "",
        NIK: "",
        Nama: "",
        "L/P": "",
        Status: "",
        "Tempat Lahir": "",
        "Tanggal Lahir": "",
        Pendidikan: "",
        Pekerjaan: "",
        Telepon: "",
        Alamat: "",
      });

      familyNumber += 1;
    }

    return rows;
  }

  function exportExcel() {
    const rows = buildGroupedRows();

    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Keluarga & Anggota");

    // Auto-size columns
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String(r[key] || "").length),
        10,
      ),
    }));
    ws["!cols"] = colWidths;

    writeFile(wb, `${safePrefix}.xlsx`);
  }

  async function exportPDF() {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const headerLines = [
      { text: "BADAN PENGURUS", size: 12, y: 13 },
      { text: "IKATAN KERUKUNAN KELUARGA FETO MONE SORONG", size: 14, y: 19 },
      { text: "(IKKFMS)", size: 12, y: 25 },
      {
        text: "Keputusan Mentri Hukum Hak Asasi Manusia Republik Indonesia",
        size: 12,
        y: 31,
      },
      { text: "Nomor AHU-0009368.AH.01.07. Tahun 2024", size: 12, y: 37 },
    ];

    let logoDataUrl = null;
    try {
      logoDataUrl = await getImageDataUrl("/logo_ikkfms.jpeg");
    } catch {}

    doc.setFont("helvetica", "bold");
    const textBlockWidth = Math.max(
      ...headerLines.map((line) => {
        doc.setFontSize(line.size);
        return doc.getTextWidth(line.text);
      }),
    );

    const logoWidth = logoDataUrl ? 22 : 0;
    const logoHeight = logoDataUrl ? 22 : 0;
    const logoGap = logoDataUrl ? 8 : 0;
    const groupWidth = logoWidth + logoGap + textBlockWidth;
    const groupStartX = pageWidth / 2 - groupWidth / 2;
    const textCenterX = groupStartX + logoWidth + logoGap + textBlockWidth / 2;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "JPEG", groupStartX, 13, logoWidth, logoHeight);
    }

    doc.setFont("helvetica", "bold");
    headerLines.forEach((line) => {
      doc.setFontSize(line.size);
      doc.text(line.text, textCenterX, line.y, { align: "center" });
    });

    doc.setLineWidth(0.3);
    doc.line(14, 41, pageWidth - 14, 41);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Diekspor: ${new Date().toLocaleDateString("id-ID")}`, 14, 47);

    const head = [
      [
        "No",
        "Nama Keluarga",
        "Peran",
        "NIK",
        "Nama",
        "L/P",
        "Status",
        "TTL",
        "Pendidikan",
        "Pekerjaan",
      ],
    ];

    const body = [];
    let familyNumber = 1;

    for (const family of families) {
      const totalPeople = 1 + (family.members?.length || 0);
      body.push([
        {
          content: `Keluarga ${familyNumber}: ${family.family_name} (${totalPeople} jiwa)`,
          colSpan: 10,
          styles: {
            fillColor: [240, 244, 255],
            textColor: [30, 41, 59],
            fontStyle: "bold",
          },
        },
      ]);

      body.push([
        familyNumber,
        family.family_name,
        "Kepala Keluarga",
        family.head_nik || "-",
        family.head_name || "-",
        family.head_gender === "Laki-laki"
          ? "L"
          : family.head_gender === "Perempuan"
            ? "P"
            : "-",
        "Kepala Keluarga",
        `${family.head_birth_place || "-"}, ${formatDate(family.head_birth_date)}`,
        family.head_education || "-",
        family.head_job || "-",
      ]);

      (family.members || []).forEach((member) => {
        body.push([
          familyNumber,
          family.family_name,
          "Anggota",
          member.nik || "-",
          member.name || "-",
          member.gender === "Laki-laki"
            ? "L"
            : member.gender === "Perempuan"
              ? "P"
              : "-",
          member.family_status || "-",
          `${member.birth_place || "-"}, ${formatDate(member.birth_date)}`,
          member.education || "-",
          member.job || "-",
        ]);
      });

      familyNumber += 1;
    }

    const tableWidth = 226;
    const tableMarginX = Math.max(14, (pageWidth - tableWidth) / 2);

    autoTable(doc, {
      head,
      body,
      startY: 52,
      tableWidth,
      margin: { left: tableMarginX, right: tableMarginX, top: 52 },
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [39, 39, 42] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 22 },
        3: { cellWidth: 24 },
        4: { cellWidth: 28 },
        5: { cellWidth: 10 },
        6: { cellWidth: 20 },
        7: { cellWidth: 42 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
      },
    });

    doc.save(`${safePrefix}.pdf`);
  }

  if (families.length === 0) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={exportExcel}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        Export Excel
      </button>
      <button
        onClick={exportPDF}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Export PDF
      </button>
    </div>
  );
}
