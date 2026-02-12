import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles/LoginScreen.style";

// Components
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

// Services
import ApiService from "../../services/api";
import StorageService from "../../services/storage";
import SocketService from "../../services/socket";

// Actions
import { login } from "../../store/authSlice";

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Estado do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Verificar se o formulário está válido em tempo real
  const checkFormValidity = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return false;
    if (!password || password.length < 1) return false;
    return true;
  };

  // Atualizar o estado de validade do formulário quando os campos mudarem
  useEffect(() => {
    setIsFormValid(checkFormValidity());
  }, [email, password]);

  // Validação de campos
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Digite um email válido";
      }
    }

    // Validar senha
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Usar o Redux para login (centraliza a lógica de autenticação)
      const resultAction = await dispatch(login({ email, password }));
      
      // Verificar se o login foi bem-sucedido
      if (login.fulfilled.match(resultAction)) {
        // Login bem-sucedido - a navegação acontecerá baseada no estado isAuthenticated
        // O authSlice já cuidou de salvar tokens, conectar socket, etc.
      } else if (login.rejected.match(resultAction)) {
        // Se rejeitado, pegar a mensagem de erro
        const errorMessage = resultAction.payload || 'Erro ao fazer login. Por favor, tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Cabeçalho e Logo */}
            <View style={styles.header}>
              <Image
                source={require("../../../assets/icon.png")} // Ajuste para seu logo
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Document App</Text>
              <Text style={styles.subtitle}>
                Crie, edite e compartilhe documentos em tempo real
              </Text>
            </View>

            {/* Formulário de Login */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Input
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  placeholder="seu.email@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail"
                  error={errors.email}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <Input
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password)
                      setErrors({ ...errors, password: null });
                  }}
                  placeholder="Sua senha"
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  error={errors.password}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <Button
                title="Entrar"
                onPress={handleLogin}
                style={styles.loginButton}
                loading={isLoading}
                disabled={!isFormValid} // Desabilita o botão se o formulário não for válido
                variant="confirm" // Novo estilo de botão de confirmação
              />

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem uma conta?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.registerLink}>Registre-se</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default LoginScreen;
