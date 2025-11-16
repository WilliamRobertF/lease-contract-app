import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: 'primary' | 'danger';
  disabled?: boolean;
}

export default function SecondaryButton({
  label,
  onPress,
  icon,
  style,
  textStyle,
  color = 'primary',
  disabled = false,
}: SecondaryButtonProps) {
  const colorMap = {
    primary: '#1976d2',
    danger: '#f44336',
  };

  const buttonColor = colorMap[color];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: buttonColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: buttonColor }, textStyle]}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={buttonColor}
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
