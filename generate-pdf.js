const { mdToPdf } = require('md-to-pdf');
const path = require('path');

async function generatePDF() {
  try {
    const pdf = await mdToPdf(
      { path: 'MANUAL_USUARIO.md' },
      {
        dest: 'MANUAL_USUARIO.pdf',
        pdf_options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
          printBackground: true,
        },
        stylesheet: path.join(__dirname, 'manual-styles.css'),
      }
    );

    console.log('✅ PDF generado exitosamente: MANUAL_USUARIO.pdf');
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
  }
}

generatePDF();
