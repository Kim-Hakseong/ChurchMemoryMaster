// Screen capture utility using html2canvas
export const captureScreen = async (): Promise<void> => {
  try {
    // Dynamic import for html2canvas
    const html2canvas = await import('html2canvas');
    
    const element = document.body;
    const canvas = await html2canvas.default(element, {
      height: window.innerHeight,
      width: window.innerWidth,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `church-memory-verse-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Screen capture failed:', error);
    
    // Fallback to print dialog
    window.print();
  }
};