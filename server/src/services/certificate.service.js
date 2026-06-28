const PDFDocument = require('pdfkit');

function generateCertificate({ volunteerName, eventName, eventDate, organiserId }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Certificate design
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#4F46E5');
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#4F46E5');

    doc.fontSize(14).fillColor('#6B7280').text('FREIWILLIGER', 0, 60, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(32).fillColor('#18181B').text('Certificate of Participation', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(14).fillColor('#6B7280').text('This is to certify that', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(28).fillColor('#4F46E5').text(volunteerName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#6B7280').text('has successfully participated as a volunteer in', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor('#18181B').text(eventName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#6B7280').text(`Date: ${eventDate}`, { align: 'center' });
    doc.moveDown(3);
    doc.fontSize(10).fillColor('#9CA3AF').text(`Certificate ID: FRWG-${Date.now().toString(36).toUpperCase()}`, { align: 'center' });

    doc.end();
  });
}

module.exports = { generateCertificate };
