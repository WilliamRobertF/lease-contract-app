import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface MaritalStatusPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export default function MaritalStatusPicker({
  value,
  onValueChange,
  style,
}: MaritalStatusPickerProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const options = [
    { key: 'single', label: t('single') },
    { key: 'married', label: t('married') },
  ];

  const selectedOption = options.find((opt) => opt.key === value);

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowModal(true)}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption ? selectedOption.label : t('selectMaritalStatus')}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectMaritalStatus')}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {options.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.optionItem,
                  value === item.key && styles.optionItemSelected,
                  index === options.length - 1 && styles.lastOptionItem,
                ]}
                onPress={() => {
                  onValueChange(item.key);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === item.key && styles.optionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {value === item.key && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color="#1976d2"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  optionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
});
