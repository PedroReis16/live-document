import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles/Input.style'; // Certifique-se de que o caminho esteja correto

// Input field com validação visual
const Input = ({
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  multiline,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  leftIcon,
  rightIcon,
  onRightIconPress,
  onLeftIconPress,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style
        ]}
      >
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            style={styles.iconContainer}
          >
            <Feather name={leftIcon} size={20} color={error ? "#f44336" : "#666"} />
          </TouchableOpacity>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#999"
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconContainer}
          >
            <Feather name={rightIcon} size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && typeof error === 'string' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

export default Input;
