import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export async function exportToPDF(
  htmlContent: string,
  fileName: string = 'contract.pdf',
  contractData?: any
) {
  try {
    const htmlString = generateContractHTML(htmlContent, contractData);

    // A4 size in pixels: 210mm x 297mm = 612px x 842px (at 72 DPI)
    const { uri } = await Print.printToFileAsync({
      html: htmlString,
      width: 612,
      height: 842,
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Salvar ou compartilhar ${fileName}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Sucesso', `Contrato salvo em: ${uri}`);
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    Alert.alert('Erro', 'Falha ao gerar PDF');
  }
}

function generateContractHTML(contractText: string, contractData?: any): string {
  const today = new Date();
  const landlordName = contractData?.landlord?.data?.name || '_________________________________';
  const landlordCPF = contractData?.landlord?.data?.cpf || '';
  const tenantName = contractData?.tenant?.name || '_________________________________';
  const tenantCPF = contractData?.tenant?.cpf || '';
  const guarantorName = contractData?.guarantor?.name;
  const guarantorCPF = contractData?.guarantor?.cpf;
  const city = contractData?.property?.data?.city || '';
  const state = contractData?.property?.data?.state || '';

  const contractParagraphs = contractText
    .split('\n\n')
    .filter((p: string) => p.trim().length > 0)
    .map((p: string) => {
      return p.replace(/^\d+\.\s/, '').trim();
    });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 14pt 14pt;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          color: #000;
          font-size: 14pt;
          line-height: 1.5;
          text-align: justify;
        }
        
        .container {
          width: 100%;
          margin: 0;
          padding: 0;
        }
        
        .header {
          text-align: center;
          margin-bottom: 14pt;
          padding-bottom: 10pt;
        }
        
        .header h1 {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 4pt;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
        }
        
        .content {
          margin-bottom: 24pt;
          text-align: justify;
        }
        
        .clause {
          margin-bottom: 10pt;
          text-align: justify;
          page-break-inside: avoid;
        }
        
        .clause-title {
          font-weight: bold;
          margin-bottom: 4pt;
          font-size: 14pt;
          text-transform: uppercase;
          text-align: justify;
        }
        
        .clause-text {
          margin-bottom: 6pt;
          font-size: 14pt;
          line-height: 1.5;
          text-align: justify;
        }
        
        .signatures {
          margin-top: 24pt;
          font-size: 14pt;
        }
        
        .signature-location {
          text-align: center;
          font-weight: normal;
          margin-bottom: 16pt;
          margin-top: 14pt;
          font-size: 12pt;
          line-height: 1.4;
        }
        
        .signature-block {
          margin-bottom: 20pt;
          page-break-inside: avoid;
        }
        
        .signature-title {
          font-weight: bold;
          margin-bottom: 6pt;
          text-transform: uppercase;
          font-size: 12pt;
          letter-spacing: 0.3pt;
        }
        
        .signature-line {
          margin-top: 24pt;
          margin-bottom: 3pt;
          border-bottom: 1pt solid #000;
          min-height: 10pt;
        }
        
        .signature-name {
          margin-top: 2pt;
          font-weight: bold;
          font-size: 12pt;
        }
        
        .signature-cpf {
          font-size: 11pt;
          color: #000;
        }
        
        .witness-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20pt;
          margin-top: 14pt;
        }
        
        .witness-block {
          page-break-inside: avoid;
        }
        
        .witness-line {
          margin-top: 24pt;
          margin-bottom: 3pt;
          border-bottom: 1pt solid #000;
          min-height: 10pt;
        }
        
        .witness-label {
          font-size: 11pt;
          color: #000;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12pt 0;
          font-size: 14pt;
        }
        
        td {
          padding: 6pt;
          border: 1pt solid #ddd;
        }
        
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Contrato de Locação</h1>
        </div>
        
        <div class="content">
          ${contractParagraphs
            .map((paragraph: string) => {
              if (paragraph.includes('CONTRATO') || paragraph.includes('LOCADOR') || paragraph.includes('LOCATÁRIO')) {
                return `<div class="clause"><div class="clause-title">${paragraph}</div></div>`;
              }
              return `<div class="clause"><div class="clause-text">${paragraph}</div></div>`;
            })
            .join('')}
        </div>
        
        <div class="signatures">
          <div class="signature-location">
            ${city.toUpperCase()} – ${state.toUpperCase()}<br/>
            _____ de _________________ de ${today.getFullYear()}
          </div>
          
          <div class="signature-block">
            <div class="signature-title">Locador (Proprietário)</div>
            <div class="signature-line"></div>
            <div class="signature-name">${landlordName}</div>
            <div class="signature-cpf">CPF: ${landlordCPF}</div>
          </div>
          
          <div class="signature-block">
            <div class="signature-title">Locatário (Inquilino)</div>
            <div class="signature-line"></div>
            <div class="signature-name">${tenantName}</div>
            <div class="signature-cpf">CPF: ${tenantCPF}</div>
          </div>
          
          ${
            guarantorName
              ? `
          <div class="signature-block">
            <div class="signature-title">Fiador</div>
            <div class="signature-line"></div>
            <div class="signature-name">${guarantorName}</div>
            <div class="signature-cpf">CPF: ${guarantorCPF}</div>
          </div>
          `
              : ''
          }
          
          <div class="signature-block">
            <div class="signature-title">Testemunhas</div>
            <div class="witness-container">
              <div class="witness-block">
                <div class="witness-line"></div>
                <div class="witness-label">CPF: _____________________</div>
              </div>
              <div class="witness-block">
                <div class="witness-line"></div>
                <div class="witness-label">CPF: _____________________</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
