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
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          color: #000;
          font-size: 11px;
          line-height: 1.4;
          text-align: left;
        }
        
        .container {
          max-width: 170mm;
          margin: 0 auto;
        }
        
        .header {
          text-align: left;
          margin-bottom: 15px;
          padding-bottom: 10px;
        }
        
        .header h1 {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        
        .header p {
          font-size: 10pt;
          color: #333;
        }
        
        .content {
          margin-bottom: 40pt;
        }
        
        .clause {
          margin-bottom: 12px;
          text-align: left;
          page-break-inside: avoid;
        }
        
        .clause-title {
          font-weight: bold;
          margin-bottom: 4px;
          text-decoration: underline;
          font-size: 11px;
        }
        
        .clause-text {
          margin-bottom: 8px;
          font-size: 11px;
        }
        
        .signatures {
          margin-top: 30px;
          font-size: 10px;
        }
        
        .signature-location {
          text-align: center;
          font-weight: bold;
          margin-bottom: 20px;
          margin-top: 20px;
          font-size: 11px;
        }
        
        .signature-block {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .signature-title {
          font-weight: bold;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-size: 10px;
        }
        
        .signature-line {
          margin-top: 25px;
          margin-bottom: 3px;
          border-bottom: 1px solid #000;
          min-height: 15px;
        }
        
        .signature-name {
          margin-top: 2px;
          font-weight: 600;
          font-size: 10px;
        }
        
        .signature-cpf {
          font-size: 9px;
          color: #333;
        }
        
        .witness-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30pt;
          margin-top: 20pt;
        }
        
        .witness-block {
          page-break-inside: avoid;
        }
        
        .witness-line {
          margin-top: 30pt;
          margin-bottom: 5pt;
          border-bottom: 1pt solid #000;
          min-height: 20pt;
        }
        
        .witness-label {
          font-size: 9pt;
          color: #333;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15pt 0;
        }
        
        td {
          padding: 8pt;
          border: 1pt solid #ddd;
          font-size: 10pt;
        }
        
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CONTRATO DE LOCAÇÃO RESIDENCIAL</h1>
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
            _____ DE _________________ DE ${today.getFullYear()}
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
