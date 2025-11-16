import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from 'docx';

export async function exportToDOCX(
  contractText: string,
  fileName: string = 'contract.docx',
  contractData?: any
) {
  try {
    const doc = generateDOCXDocument(contractText, contractData);
    
    // Use Packer to generate the document as a Uint8Array
    const docArrayBuffer = await (Packer as any).toBuffer(doc);
    
    // For React Native, we need to use the global Buffer
    const uint8Array = new Uint8Array(docArrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    
    // Create base64 encoded data URI
    const base64 = btoa(binaryString);
    const fileUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: `Salvar ou compartilhar ${fileName}`,
        UTI: 'com.microsoft.word.doc',
      });
    } else {
      Alert.alert('Sucesso', 'Contrato DOCX gerado com sucesso');
    }
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    Alert.alert('Aviso', 'DOCX tem suporte limitado em React Native.\nUse PDF como alternativa principal.');
  }
}

function generateDOCXDocument(contractText: string, contractData?: any): Document {
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
    .map((p: string) => p.replace(/^\d+\.\s/, '').trim());

  const sections: Paragraph[] = [];

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, lineRule: 'auto', after: 240 },
      children: [
        new TextRun({
          text: 'CONTRATO DE LOCAÇÃO RESIDENCIAL',
          bold: true,
          size: 28,
          font: 'Arial',
        }),
      ],
    })
  );

  contractParagraphs.forEach((paragraph: string) => {
    const isBold =
      paragraph.includes('CONTRATO') ||
      paragraph.includes('LOCADOR') ||
      paragraph.includes('LOCATÁRIO');

    sections.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360, lineRule: 'auto', after: 200 },
        children: [
          new TextRun({
            text: paragraph,
            bold: isBold,
            size: 20,
            font: 'Arial',
          }),
        ],
      })
    );
  });

  sections.push(
    new Paragraph({
      text: '',
      spacing: { line: 240, lineRule: 'auto', before: 400, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, lineRule: 'auto', after: 240 },
      children: [
        new TextRun({
          text: `${city.toUpperCase()} – ${state.toUpperCase()}`,
          bold: true,
          size: 20,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, lineRule: 'auto', after: 400 },
      children: [
        new TextRun({
          text: `_____ DE _________________ DE ${today.getFullYear()}`,
          size: 20,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 360, lineRule: 'auto', after: 400 },
      children: [
        new TextRun({
          text: 'LOCADOR (PROPRIETÁRIO):',
          bold: true,
          size: 20,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      text: '',
      spacing: { line: 240, lineRule: 'auto', before: 300, after: 120 },
      border: {
        bottom: {
          color: '000000',
          space: 24,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto', after: 80 },
      children: [
        new TextRun({
          text: landlordName,
          bold: true,
          size: 20,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto' },
      children: [
        new TextRun({
          text: `CPF: ${landlordCPF}`,
          size: 18,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 360, lineRule: 'auto', before: 400, after: 400 },
      children: [
        new TextRun({
          text: 'LOCATÁRIO (INQUILINO):',
          bold: true,
          size: 20,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      text: '',
      spacing: { line: 240, lineRule: 'auto', before: 300, after: 120 },
      border: {
        bottom: {
          color: '000000',
          space: 24,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto', after: 80 },
      children: [
        new TextRun({
          text: tenantName,
          bold: true,
          size: 20,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto' },
      children: [
        new TextRun({
          text: `CPF: ${tenantCPF}`,
          size: 18,
          font: 'Arial',
        }),
      ],
    })
  );

  if (guarantorName) {
    sections.push(
      new Paragraph({
        spacing: { line: 360, lineRule: 'auto', before: 400, after: 400 },
        children: [
          new TextRun({
            text: 'FIADOR:',
            bold: true,
            size: 20,
            font: 'Arial',
          }),
        ],
      })
    );

    // Signature line
    sections.push(
      new Paragraph({
        spacing: { line: 240, lineRule: 'auto', before: 300, after: 120 },
        border: {
          bottom: {
            color: '000000',
            space: 24,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      })
    );

    sections.push(
      new Paragraph({
        spacing: { line: 240, lineRule: 'auto', after: 80 },
        children: [
          new TextRun({
            text: guarantorName,
            bold: true,
            size: 20,
            font: 'Arial',
          }),
        ],
      })
    );

    sections.push(
      new Paragraph({
        spacing: { line: 240, lineRule: 'auto' },
        children: [
          new TextRun({
            text: `CPF: ${guarantorCPF}`,
            size: 18,
            font: 'Arial',
          }),
        ],
      })
    );
  }

  sections.push(
    new Paragraph({
      spacing: { line: 360, lineRule: 'auto', before: 400, after: 400 },
      children: [
        new TextRun({
          text: 'TESTEMUNHAS:',
          bold: true,
          size: 20,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto', before: 200, after: 120 },
      border: {
        bottom: {
          color: '000000',
          space: 24,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto', after: 240 },
      children: [
        new TextRun({
          text: 'CPF: _____________________',
          size: 18,
          font: 'Arial',
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto', before: 300, after: 120 },
      border: {
        bottom: {
          color: '000000',
          space: 24,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
    })
  );

  sections.push(
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto', after: 240 },
      children: [
        new TextRun({
          text: 'CPF: _____________________',
          size: 18,
          font: 'Arial',
        }),
      ],
    })
  );

  return new Document({
    sections: [
      {
        children: sections,
        properties: {
          page: {
            margin: {
              top: 1440 * 0.79, // 20mm
              right: 1440 * 0.79,
              bottom: 1440 * 0.79,
              left: 1440 * 0.79,
            },
          },
        },
      },
    ],
  });
}
