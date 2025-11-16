import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export async function exportToPDF(htmlContent: string, fileName: string = 'contract.pdf') {
  try {
    // Convert plain text to HTML
    const htmlLines = htmlContent.split('\n').map(line => 
      `<p style="margin: 0; padding: 0; white-space: pre-wrap; font-family: monospace; font-size: 11px;">${escapeHtml(line)}</p>`
    ).join('');

    const htmlString = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <style>
          body {
            margin: 20px;
            font-family: 'Arial', sans-serif;
            color: #333;
            font-size: 12px;
            line-height: 1.5;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .content {
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.4;
          }
          p {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div class="content">
          ${htmlLines}
        </div>
      </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlString,
    });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Save or share ${fileName}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Success', `Contract saved to: ${uri}`);
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF');
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
