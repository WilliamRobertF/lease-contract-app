import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import {
  getLandlords,
  getProperties,
  getTemplates,
  getClauses,
  getGeneratedContracts,
  saveLandlord,
  saveProperty,
  saveTemplate,
  saveClauses,
  saveGeneratedContract,
  resetAllData,
} from './storageManager';
import { LandlordProfile, PropertyProfile, ContractTemplate, Clause, GeneratedContract } from '../types/contractTypes';

const BACKUP_VERSION = 1;

interface BackupData {
  version: number;
  timestamp: string;
  landlords: LandlordProfile[];
  properties: PropertyProfile[];
  templates: ContractTemplate[];
  clauses: Clause[];
  generatedContracts: GeneratedContract[];
}

export const exportData = async (t: (key: string) => string): Promise<boolean> => {
  try {
    const landlords = await getLandlords();
    const properties = await getProperties();
    const templates = await getTemplates();
    const clauses = await getClauses();
    const generatedContracts = await getGeneratedContracts();

    const backupData: BackupData = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      landlords,
      properties,
      templates,
      clauses,
      generatedContracts,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `lease_contract_backup_${new Date().toISOString().split('T')[0]}.json`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, jsonString, {
      encoding: 'utf8',
    });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(t('error'), t('shareNotAvailable'));
      return false;
    }

    await Sharing.shareAsync(filePath);
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    Alert.alert(t('error'), t('exportError'));
    return false;
  }
};

export const importData = async (t: (key: string) => string): Promise<boolean> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return false;
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'utf8',
    });

    let backupData: BackupData;
    try {
      backupData = JSON.parse(fileContent);
    } catch (e) {
      Alert.alert(t('error'), t('invalidFileMessage'));
      return false;
    }

    if (!backupData.version || !backupData.landlords || !backupData.properties) {
      Alert.alert(t('error'), t('invalidBackupFormat'));
      return false;
    }

    // Basic version check - for now just warn if different, but try to import
    // if (backupData.version !== BACKUP_VERSION) {
    //   console.warn(`Backup version mismatch: ${backupData.version} vs ${BACKUP_VERSION}`);
    // }

    // Confirm overwrite
    return new Promise((resolve) => {
      Alert.alert(
        t('confirmImportTitle'),
        t('confirmImportMessage'),
        [
          {
            text: t('cancel'),
            onPress: () => resolve(false),
            style: 'cancel',
          },
          {
            text: t('import'),
            onPress: async () => {
              try {
                // Import Landlords
                for (const item of backupData.landlords) {
                  await saveLandlord(item);
                }
                // Import Properties
                for (const item of backupData.properties) {
                  await saveProperty(item);
                }
                // Import Templates
                for (const item of backupData.templates) {
                  await saveTemplate(item);
                }
                // Import Clauses (Overwrite all if present)
                if (backupData.clauses && backupData.clauses.length > 0) {
                  await saveClauses(backupData.clauses);
                }
                // Import Contracts
                for (const item of backupData.generatedContracts) {
                  await saveGeneratedContract(item);
                }

                Alert.alert(t('success'), t('importSuccess'));
                resolve(true);
              } catch (error) {
                console.error('Error importing data:', error);
                Alert.alert(t('error'), t('importError'));
                resolve(false);
              }
            },
          },
        ]
      );
    });

  } catch (error) {
    console.error('Error picking document:', error);
    return false;
  }
};
