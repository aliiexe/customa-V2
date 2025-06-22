import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

export const exportToPdf = async (element: HTMLElement, filename: string) => {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });
    
    // Get current date for the header
    const date = new Date().toLocaleDateString();
    
    // Add header with logo (if available) and title
    pdf.setFontSize(22);
    pdf.setTextColor(46, 125, 50); // Green color
    pdf.text(filename.replace('.pdf', ''), 40, 40);
    
    // Add date
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100); // Gray color
    pdf.text(`Generated on: ${date}`, 40, 60);
    
    // Add a line separator
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(46, 125, 50); // Green color
    pdf.line(40, 70, pdf.internal.pageSize.getWidth() - 40, 70);
    
    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 1.5, // Higher scale for better resolution
      useCORS: true, // Enable CORS for images
      logging: false // Disable logging
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions to fit the page
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 80;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Add the image
    pdf.addImage(imgData, 'PNG', 40, 90, pdfWidth, pdfHeight);
    
    // Add page number
    pdf.setFontSize(10);
    pdf.text(`Page 1`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 30, { align: 'center' });
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('© Product Dashboard 2023 - All rights reserved', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 20, { align: 'center' });
    
    // Save the PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};