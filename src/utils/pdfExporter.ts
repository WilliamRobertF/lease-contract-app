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
  const day = today.getDate();
  const year = today.getFullYear();
  
  const landlordName = contractData?.landlord?.data?.name || '';
  const landlordRG = contractData?.landlord?.data?.rg || '';
  const landlordCPF = contractData?.landlord?.data?.cpf || '';
  const landlordBirthplace = contractData?.landlord?.data?.birthplace || '';
  const landlordMaritalStatus = contractData?.landlord?.data?.maitalStatus || '';
  const landlordNationality = contractData?.landlord?.data?.nationality || '';
  
  const tenantName = contractData?.tenant?.name || '';
  const tenantRG = contractData?.tenant?.rg || '';
  const tenantCPF = contractData?.tenant?.cpf || '';
  const tenantBirthplace = contractData?.tenant?.birthplace || '';
  const tenantMaritalStatus = contractData?.tenant?.maitalStatus || '';
  const tenantNationality = contractData?.tenant?.nationality || '';
  
  const guarantorName = contractData?.guarantor?.name || '';
  const guarantorRG = contractData?.guarantor?.rg || '';
  const guarantorCPF = contractData?.guarantor?.cpf || '';
  
  const city = contractData?.property?.data?.city || '';
  const state = contractData?.property?.data?.state || '';

  // Parse clauses from contractText - they come formatted as "CLÁUSULA PRIMEIRA: content"
  const clauseRegex = /CLÁUSULA\s+([A-ZÁÉÍÓÚàáéíóú\s]+):\s*([\s\S]*?)(?=CLÁUSULA\s+|$)/gi;
  let clausesHtml = '';
  let match;
  
  while ((match = clauseRegex.exec(contractText)) !== null) {
    const clauseTitle = match[1].trim();
    const clauseContent = match[2].trim();
    clausesHtml += `<p style="text-align: justify; margin-bottom: 12pt;"><strong>CLÁUSULA ${clauseTitle}:</strong> ${clauseContent}</p>`;
  }

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
          font-family: 'Times New Roman', serif;
          color: #000;
          font-size: 12pt;
          font-weight: bold;
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
          font-family: 'Arial', sans-serif;
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 4pt;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
        }
        
        .parties {
          margin-bottom: 14pt;
          text-align: justify;
        }
        
        .party {
          margin-bottom: 10pt;
          font-weight: bold;
          font-size: 12pt;
          text-align: justify;
        }
        
        .content {
          margin-bottom: 24pt;
          text-align: justify;
        }
        
        .clause {
          margin-bottom: 12pt;
          text-align: justify;
          page-break-inside: avoid;
        }
        
        .clause p {
          margin: 0;
          text-align: justify;
          font-weight: bold;
        }
        
        .signatures {
          margin-top: 24pt;
          font-size: 12pt;
        }
        
        .signature-location {
          text-align: center;
          font-weight: bold;
          margin-bottom: 16pt;
          margin-top: 14pt;
          font-size: 12pt;
          line-height: 1.4;
        }
        
        .signature-block {
          margin-bottom: 20pt;
          page-break-inside: avoid;
          text-align: left;
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
          font-size: 12pt;
          color: #000;
          font-weight: bold;
        }
        
        .witness-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20pt;
          margin-top: 14pt;
        }
        
        .witness-block {
          page-break-inside: avoid;
          text-align: left;
        }
        
        .witness-line {
          margin-top: 24pt;
          margin-bottom: 3pt;
          border-bottom: 1pt solid #000;
          min-height: 10pt;
        }
        
        .witness-label {
          font-size: 12pt;
          color: #000;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Contrato de Locação Residencial</h1>
        </div>
        
        <div class="parties">
          <p class="party"><strong>São partes neste instrumento:</strong></p>
          
          <p class="party">
            <strong>LOCADOR(A):</strong> ${landlordName.toUpperCase()}, ${landlordNationality}, ${landlordMaritalStatus}, portador(a) do RG nº ${landlordRG} e inscrito(a) no CPF/MF nº ${landlordCPF}, nascido(a) em ${landlordBirthplace}.
          </p>
          
          <p class="party">
            <strong>LOCATÁRIO(A):</strong> Senhor(a) ${tenantName.toUpperCase()}, ${tenantNationality}, portador(a) do RG nº ${tenantRG} e inscrito(a) no CPF nº ${tenantCPF}, nascido(a) em ${tenantBirthplace}.
          </p>
          
          ${
            guarantorName
              ? `<p class="party">
                 <strong>FIADOR(A):</strong> ${guarantorName.toUpperCase()}, portador(a) do RG nº ${guarantorRG} e inscrito(a) no CPF nº ${guarantorCPF}.
               </p>`
              : ''
          }
        </div>
        
        <div class="content">
          <div class="clause">
            ${clausesHtml}
          </div>
        </div>
        
        <div class="signatures">
          <div class="signature-location">
            <strong>${city.toUpperCase()} – ${state.toUpperCase()}, _____ de _________________ de ${year}</strong>
          </div>
          
          <div class="signature-block">
            <div class="signature-title">LOCADOR:</div>
            <div class="signature-line"></div>
            <div class="signature-name">${landlordName.toUpperCase()}</div>
            <div class="signature-cpf"><strong>CPF: ${landlordCPF}</strong></div>
          </div>
          
          <div class="signature-block">
            <div class="signature-title">LOCATÁRIO:</div>
            <div class="signature-line"></div>
            <div class="signature-name">${tenantName.toUpperCase()}</div>
            <div class="signature-cpf"><strong>CPF: ${tenantCPF}</strong></div>
          </div>
          
          ${
            guarantorName
              ? `
          <div class="signature-block">
            <div class="signature-title">FIADOR:</div>
            <div class="signature-line"></div>
            <div class="signature-name">${guarantorName.toUpperCase()}</div>
            <div class="signature-cpf"><strong>CPF: ${guarantorCPF}</strong></div>
          </div>
          `
              : ''
          }
          
          <div class="signature-block">
            <div class="signature-title">TESTEMUNHAS:</div>
            <div class="witness-container">
              <div class="witness-block">
                <div class="witness-line"></div>
                <div class="witness-label"><strong>CPF: _____________________</strong></div>
              </div>
              <div class="witness-block">
                <div class="witness-line"></div>
                <div class="witness-label"><strong>CPF: _____________________</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
