import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToJSON = (data: any, fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: any[], fileName: string) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header];
        const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportReportToPDF = (title: string, sections: { title: string, content: any, type: 'text' | 'table' | 'list' }[]) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(title, 20, yPos);
  yPos += 15;

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 20;

  sections.forEach((section) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, 20, yPos);
    yPos += 10;

    if (section.type === 'text') {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(String(section.content), 170);
      doc.text(lines, 20, yPos);
      yPos += (lines.length * 5) + 10;
    } else if (section.type === 'list') {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      (section.content as string[]).forEach((item) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const bulletLines = doc.splitTextToSize(`• ${item}`, 160);
        doc.text(bulletLines, 25, yPos);
        yPos += (bulletLines.length * 5);
      });
      yPos += 10;
    } else if (section.type === 'table') {
      const data = section.content as any[];
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(h => String(obj[h])));

        autoTable(doc, {
          startY: yPos,
          head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1))],
          body: rows,
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [79, 70, 229] },
          margin: { left: 20, right: 20 }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    }
  });

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_report.pdf`);
};
