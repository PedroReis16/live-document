import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {styles} from './styles/ForgotPasswordScreen.style';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Services
import ApiService from '../../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Validação básica de email
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enviar email de recuperação
  const handleSubmit = async () => {
    if (!isEmailValid(email)) {
      Alert.alert('Erro', 'Por favor, digite um email válido.');
      return;
    }
    
    setLoading(true);
    try {
      await ApiService.requestPasswordReset(email);
      setResetSent(true);
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao solicitar a recuperação de senha. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Botão de voltar */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            
            <View style={styles.content}>
              {!resetSent ? (
                // Formulário de recuperação de senha
                <>
                  <View style={styles.header}>
                    <Text style={styles.title}>Recuperar Senha</Text>
                    <Text style={styles.subtitle}>
                      Digite seu email para receber um link de recuperação de senha
                    </Text>
                  </View>

                  {/* Ícone */}
                  <View style={styles.iconContainer}>
                    <Feather name="lock" size={64} color="#2196f3" />
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <Input
                        value={email}
                        onChangeText={setEmail}
                        placeholder="seu.email@exemplo.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail"
                      />
                    </View>

                    <Button
                      title="Enviar link de recuperação"
                      onPress={handleSubmit}
                      loading={loading}
                      style={styles.button}
                    />
                  </View>
                </>
              ) : (
                // Mensagem de confirmação
                <>
                  <View style={styles.successContainer}>
                    <Feather name="check-circle" size={80} color="#4caf50" />
                    <Text style={styles.successTitle}>Email enviado!</Text>
                    <Text style={styles.successText}>
                      Enviamos um link de recuperação de senha para o email {email}.
                      Por favor, verifique sua caixa de entrada e siga as instruções.
                    </Text>
                  </View>

                  <Button
                    title="Voltar para o login"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.button}
                  />
                </>
              )}
              
              {/* Link para voltar ao login */}
              <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>Voltar para o login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default ForgotPasswordScreen;