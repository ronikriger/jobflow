"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Application } from "@/lib/types";
import { format } from "date-fns";

// Export applications to CSV
export function exportToCSV(applications: Application[], filename = "job-applications") {
    const headers = [
        "Company",
        "Role",
        "Status",
        "Location",
        "Salary",
        "Platform",
        "Priority",
        "Applied Date",
        "Last Updated",
        "URL",
        "Notes"
    ];

    const rows = applications.map(app => [
        app.company,
        app.role,
        app.status,
        app.location || "",
        app.salary || "",
        app.platform,
        app.priority || "medium",
        app.appliedAt ? format(new Date(app.appliedAt), "yyyy-MM-dd") : "",
        format(new Date(app.updatedAt), "yyyy-MM-dd"),
        app.url || "",
        app.notes?.replace(/,/g, ";") || ""
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Export applications to PDF
export function exportToPDF(applications: Application[], filename = "job-applications") {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Blue
    doc.text("JobFlow", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Job Application Report", 14, 28);
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, 14, 35);

    // Summary stats
    const stats = {
        total: applications.length,
        applied: applications.filter(a => a.status === "applied").length,
        interviewing: applications.filter(a => ["screen", "interview1", "interview2", "final"].includes(a.status)).length,
        offers: applications.filter(a => a.status === "offer").length,
        rejected: applications.filter(a => a.status === "rejected").length,
    };

    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Total: ${stats.total} | Applied: ${stats.applied} | Interviewing: ${stats.interviewing} | Offers: ${stats.offers} | Rejected: ${stats.rejected}`, 14, 45);

    // Table
    const tableData = applications.map(app => [
        app.company,
        app.role,
        app.status.charAt(0).toUpperCase() + app.status.slice(1),
        app.location || "-",
        app.appliedAt ? format(new Date(app.appliedAt), "MM/dd/yy") : "-"
    ]);

    autoTable(doc, {
        startY: 52,
        head: [["Company", "Role", "Status", "Location", "Applied"]],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: "bold"
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250]
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 50 },
            2: { cellWidth: 25 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25 }
        }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} | Exported from JobFlow`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
        );
    }

    doc.save(`${filename}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
