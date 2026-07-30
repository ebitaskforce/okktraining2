import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (filename: string, rows: Record<string, any>[]) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (
  title: string, 
  headers: string[], 
  rows: (string | number)[][], 
  filename: string
) => {
  const doc = new jsPDF();
  
  // Header section
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  
  autoTable(doc, {
    startY: 34,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 34 }
  });

  doc.save(`${filename}.pdf`);
};
