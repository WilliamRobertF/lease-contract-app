import { Alert } from 'react-native';

export async function exportToDOCX(
  contractText: string,
  fileName: string = 'contract.docx',
  contractData?: any
) {
  Alert.alert(
    'Formato DOCX',
    'DOCX não é suportado em React Native no momento.\n\nUse PDF como alternativa para exportar seus contratos.',
    [{ text: 'OK' }]
  );
}
