import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (element: HTMLElement, filename: string) => {
  try {
    // Show loading state
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white p-3 rounded shadow-lg z-50';
    loadingToast.textContent = 'Generating PDF... Please wait';
    document.body.appendChild(loadingToast);

    // Create a clone of the element to modify for PDF
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Apply PDF-specific styles
    clonedElement.style.width = '794px'; // A4 width in pixels at 96 DPI
    clonedElement.style.backgroundColor = 'white';
    clonedElement.style.padding = '20px';
    clonedElement.style.fontFamily = 'Arial, sans-serif';
    
    // Temporarily add to document for rendering
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    document.body.appendChild(clonedElement);

    // Use html2canvas to capture the element
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Higher scale for better resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      removeContainer: true,
      width: 794,
      windowWidth: 794
    });

    // Remove the cloned element
    document.body.removeChild(clonedElement);
    document.body.removeChild(loadingToast);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20; // Account for margins

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    // Add header to all pages
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // // Add title
      // pdf.setFontSize(16);
      // pdf.setTextColor(46, 125, 50); // Green color
      // pdf.text(filename.replace('.pdf', ''), 10, 25);
      
      // // Add date
      // pdf.setFontSize(10);
      // pdf.setTextColor(100, 100, 100);
      // pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 35);
      
      // Add page number
      pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 30, pdfHeight - 10);
    }

    // Save the PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};