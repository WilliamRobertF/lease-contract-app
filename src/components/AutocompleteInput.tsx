import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  suggestions: string[];
  style?: StyleProp<ViewStyle>;
  maxSuggestions?: number;
  allowCustom?: boolean;
  onFocus?: () => void;
}

export default function AutocompleteInput({
  value,
  onChangeText,
  placeholder,
  suggestions,
  style,
  maxSuggestions = 5,
  allowCustom = true,
  onFocus,
}: AutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value.trim().length > 0) {
      const filtered = suggestions
        .filter((item) =>
          item.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, maxSuggestions);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions, maxSuggestions]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          onFocus={() => {
            setShowSuggestions(true);
            onFocus?.();
          }}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              setShowSuggestions(false);
            }}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
          >
            {filteredSuggestions.map((item, index) => (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={styles.suggestionItem}
                onPress={() => {
                  onChangeText(item);
                  setShowSuggestions(false);
                }}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={18}
                  color="#999"
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});
