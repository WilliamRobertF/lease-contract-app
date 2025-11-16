import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export async function exportToPDF(
  htmlContent: string,
  fileName: string = "contract.pdf",
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
        mimeType: "application/pdf",
        dialogTitle: `Salvar ou compartilhar ${fileName}`,
        UTI: "com.adobe.pdf",
      });
    } else {
      Alert.alert("Sucesso", `Contrato salvo em: ${uri}`);
    }
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    Alert.alert("Erro", "Falha ao gerar PDF");
  }
}

function generateContractHTML(
  contractText: string,
  contractData?: any
): string {
  const today = new Date();
  const day = today.getDate();
  const year = today.getFullYear();

  const landlordName = contractData?.landlord?.data?.name || "";
  const landlordRG = contractData?.landlord?.data?.rg || "";
  const landlordCPF = contractData?.landlord?.data?.cpf || "";
  const landlordBirthplace = contractData?.landlord?.data?.birthplace || "";
  const landlordMaritalStatus =
    contractData?.landlord?.data?.maitalStatus || "";
  const landlordNationality = contractData?.landlord?.data?.nationality || "";

  const tenantName = contractData?.tenant?.name || "";
  const tenantRG = contractData?.tenant?.rg || "";
  const tenantCPF = contractData?.tenant?.cpf || "";
  const tenantBirthplace = contractData?.tenant?.birthplace || "";
  const tenantMaritalStatus = contractData?.tenant?.maitalStatus || "";
  const tenantNationality = contractData?.tenant?.nationality || "";

  const guarantorName = contractData?.guarantor?.name || "";
  const guarantorRG = contractData?.guarantor?.rg || "";
  const guarantorCPF = contractData?.guarantor?.cpf || "";

  const city = contractData?.property?.data?.city || "";
  const state = contractData?.property?.data?.state || "";
  const propertyDescription = contractData?.property?.data?.description || "";

  // Contract financial and date information
  const monthlyRentStr = String(contractData?.monthlyRent || '0');
  const monthlyRent = parseFloat(monthlyRentStr.replace(',', '.'));
  
  const dueDay = contractData?.dueDay || 1;
  const startDate = contractData?.startDate ? new Date(contractData.startDate) : new Date();
  const endDate = contractData?.endDate ? new Date(contractData.endDate) : new Date();
  
  // Format dates to Brazilian format (DD/MM/YYYY)
  const formatBrazilianDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const startDateFormatted = formatBrazilianDate(startDate);
  const endDateFormatted = formatBrazilianDate(endDate);
  const monthlyRentFormatted = monthlyRent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Convert contractText to HTML paragraphs
  // contractText already contains the formatted header and clauses from contractFormatter
  const textLines = contractText
    .split("\n")
    .filter((line: string) => line.trim().length > 0)
    .map((line: string) => line.trim());
  
  // Process lines: include all content from header and clauses
  let contractHtml = "";
  
  textLines.forEach((line: string) => {
    if (line.length > 0) {
      contractHtml += `<p style="text-align: justify; margin-bottom: 12pt;"><strong>${line}</strong></p>`;
    }
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">

  <style>
    @page {
      size: A4;
      margin: 40pt;
    }

    body {
      font-family: "Times New Roman", serif;
      font-size: 12pt;
      font-weight: bold;
      color: #000;
      line-height: 1.35;
      text-align: justify;
    }

    h1 {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 18pt;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
    }

    p {
      margin-bottom: 10pt;
      font-weight: bold;
      text-align: justify;
    }

    .date-location {
      text-align: center;
      margin-bottom: 40pt;
      font-weight: bold;
    }

    .signature-section {
      margin-top: 40pt;
      text-align: center;
    }

    .signature-block {
      margin-top: 24pt;
      margin-bottom: 12pt;
      text-align: left;
    }

    .signature-line {
      margin-top: 30pt;
      border-bottom: 1px solid #000;
      width: 100%;
      height: 1pt;
    }

    .signature-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 12pt;
      font-size: 12pt;
    }

    .signature-name {
      font-weight: bold;
      margin-top: 2pt;
      font-size: 12pt;
    }

    .signature-cpf {
      font-weight: bold;
      font-size: 12pt;
    }

    .parties {
      margin-bottom: 14pt;
    }

    .clauses {
      margin-bottom: 24pt;
    }
  </style>
</head>

<body>

<h1>CONTRATO DE LOCAÇÃO RESIDENCIAL</h1>

${contractHtml}

<div class="date-location">
  <p><strong>${city.toUpperCase()} – ${state.toUpperCase()}, _____ de _________________ de ${year}</strong></p>
</div>

<div class="signature-section">
    <div class="signature-title">LOCADOR:</div>
    <div class="signature-line"></div>
    <div class="signature-name"><strong>${landlordName.toUpperCase()}</strong></div>
    <div class="signature-cpf"><strong>CPF: ${landlordCPF}</strong></div>
  </div>

  <div class="signature-block">
    <div class="signature-title">LOCATÁRIO:</div>
    <div class="signature-line"></div>
    <div class="signature-name"><strong>${tenantName.toUpperCase()}</strong></div>
    <div class="signature-cpf"><strong>CPF: ${tenantCPF}</strong></div>
  </div>

  ${
    guarantorName
      ? `
  <div class="signature-block">
    <div class="signature-title">FIADOR:</div>
    <div class="signature-line"></div>
    <div class="signature-name"><strong>${guarantorName.toUpperCase()}</strong></div>
    <div class="signature-cpf"><strong>CPF: ${guarantorCPF}</strong></div>
  </div>`
      : ""
  }

  <div class="signature-block">
    <div class="signature-title">TESTEMUNHAS:</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20pt; margin-top: 14pt;">
      <div>
        <div class="signature-line"></div>
        <div class="signature-cpf"><strong>CPF: _____________________</strong></div>
      </div>
      <div>
        <div class="signature-line"></div>
        <div class="signature-cpf"><strong>CPF: _____________________</strong></div>
      </div>
    </div>
  </div>

</div>

</body>
</html>
`;
}
