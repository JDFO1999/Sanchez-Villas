import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ReportConfig {
  title: string;
  columns: string[];
  data: any[][];
  filename: string;
  appName?: string;
  logoUrl?: string;
}

// Helper to load image to Base64
const loadImageToBase64 = async (url: string): Promise<string | null> => {
  if (url.startsWith('data:image')) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
};

/**
 * Export data to a highly professional PDF file.
 */
export const exportToPDF = async (config: ReportConfig) => {
  const { title, columns, data, filename, appName = 'GymPro', logoUrl } = config;
  const doc = new jsPDF('portrait', 'pt', 'a4');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // --- HEADER ---
  // 1. Logo / App Name (Top Left)
  if (logoUrl) {
    const base64Logo = await loadImageToBase64(logoUrl);
    if (base64Logo) {
      // Add image: x, y, width, height. We'll use 50x50 as standard
      try {
        const imgProps = doc.getImageProperties(base64Logo);
        const ratio = imgProps.width / imgProps.height;
        const h = 40;
        const w = h * ratio;
        doc.addImage(base64Logo, 40, 35, w, h);
        
        // App name next to logo
        doc.setFontSize(24);
        doc.setTextColor(41, 128, 185);
        doc.setFont("helvetica", "bold");
        doc.text(appName.toUpperCase(), 40 + w + 15, 55);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("Reporte Oficial Administrativo", 40 + w + 15, 70);
      } catch (e) {
        // Fallback to text if image fails
        doc.setFontSize(24);
        doc.setTextColor(41, 128, 185);
        doc.setFont("helvetica", "bold");
        doc.text(appName.toUpperCase(), 40, 50);
      }
    } else {
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185);
      doc.setFont("helvetica", "bold");
      doc.text(appName.toUpperCase(), 40, 50);
    }
  } else {
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.setFont("helvetica", "bold");
    doc.text(appName.toUpperCase(), 40, 50);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte Oficial Administrativo", 40, 65);
  }

  // 2. Corporate Details (Top Right)
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  // They requested RIF and Phone. Using placeholders that look professional.
  doc.text("RIF: J-45678912-3", pageWidth - 40, 40, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Av. Principal, Edif. Central", pageWidth - 40, 55, { align: 'right' });
  doc.text("Telf: +58 412 123 4567", pageWidth - 40, 70, { align: 'right' });
  doc.text(`Fecha de emision: ${new Date().toLocaleDateString()}`, pageWidth - 40, 85, { align: 'right' });

  // 3. Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(40, 100, pageWidth - 40, 100);

  // --- DOCUMENT TITLE ---
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 135, { align: 'center' });

  // --- DATA TABLE ---
  if (data && data.length > 0) {
    autoTable(doc, {
      startY: 160,
      head: [columns],
      body: data,
      theme: 'striped',
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: 50
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      margin: { left: 40, right: 40 },
    });
  } else {
    // Empty state message
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("No se encontraron registros para este reporte en el periodo seleccionado.", pageWidth / 2, 180, { align: 'center' });
  }

  // --- FOOTER ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    
    // Line above footer
    doc.setDrawColor(230, 230, 230);
    doc.line(40, doc.internal.pageSize.getHeight() - 40, pageWidth - 40, doc.internal.pageSize.getHeight() - 40);
    
    doc.text(`Reporte generado por ${appName} System`, 40, doc.internal.pageSize.getHeight() - 25);
    doc.text(`Pagina ${i} de ${pageCount}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 25, { align: 'right' });
  }

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (data: any[], sheetName: string, filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
