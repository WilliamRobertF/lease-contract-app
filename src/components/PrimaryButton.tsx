import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

export default function PrimaryButton({
  label,
  onPress,
  icon,
  style,
  textStyle,
  color = 'primary',
  disabled = false,
}: PrimaryButtonProps) {
  const colorMap = {
    primary: '#1976d2',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
  };

  const buttonColor = colorMap[color];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
        )}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
