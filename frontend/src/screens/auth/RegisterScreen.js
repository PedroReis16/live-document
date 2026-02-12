import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
import { styles } from "./styles/RegisterScreen.style";

// Components
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

// Actions
import { register } from "../../store/authSlice";

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Estado do formulário
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Verificar se o formulário está válido para habilitar o botão
  const [isFormValid, setIsFormValid] = useState(false);

  // Função para verificar a validade do formulário em tempo real
  const checkFormValidity = () => {
    // Verificar nome de usuário
    if (!username || username.length < 3) return false;

    // Verificar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return false;

    // Verificar senha
    if (!password || password.length < 6) return false;

    // Verificar confirmação de senha
    if (password !== confirmPassword) return false;

    // Verificar termos
    if (!acceptTerms) return false;

    return true;
  };

  // Atualizar estado de validade do formulário quando os campos mudarem
  useEffect(() => {
    setIsFormValid(checkFormValidity());
  }, [username, email, password, confirmPassword, acceptTerms]);

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};

    // Validar nome de usuário
    if (!username) {
      newErrors.username = "Nome de usuário é obrigatório";
    } else if (username.length < 3) {
      newErrors.username = "Nome de usuário deve ter pelo menos 3 caracteres";
    }

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
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
    }

    // Validar confirmação de senha
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não correspondem";
    }

    // Validar termos
    if (!acceptTerms) {
      newErrors.terms = "Você deve aceitar os termos e condições";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de registro
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Preparar dados do usuário
      const userData = {
        username,
        email,
        password,
      };

      const registerResult = await dispatch(register(userData));

      if (register.fulfilled.match(registerResult)) {
        ///
      } else if (register.rejected.match(registerResult)) {
        const errorMessage =
          registerResult.error.message ||
          "Erro ao criar conta. Tente novamente.";
        Alert.alert("Erro", errorMessage);
      }
    } catch (error) {
      console.error("Erro no registro:", error);

      // Mensagem de erro personalizada
      let errorMessage = "Erro ao criar sua conta. Por favor, tente novamente.";

      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = "Este email ou nome de usuário já está em uso.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      Alert.alert("Erro", errorMessage);
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
            {/* Botão de voltar */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>

            {/* Cabeçalho */}
            <View style={styles.header}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>
                Preencha os dados abaixo para criar sua conta
              </Text>
            </View>

            {/* Formulário de Cadastro */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome de usuário</Text>
                <Input
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username)
                      setErrors({ ...errors, username: null });
                  }}
                  placeholder="Escolha um nome de usuário"
                  autoCapitalize="none"
                  leftIcon="user"
                  error={errors.username}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

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
                  placeholder="Crie uma senha forte"
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <Input
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: null });
                  }}
                  placeholder="Confirme sua senha"
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  error={errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Termos e condições */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => {
                  setAcceptTerms(!acceptTerms);
                  if (errors.terms) setErrors({ ...errors, terms: null });
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptTerms && styles.checkboxActive,
                  ]}
                >
                  {acceptTerms && (
                    <Feather name="check" size={14} color="#fff" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  Aceito os{" "}
                  <Text style={styles.termsLink}>termos de serviço</Text> e a{" "}
                  <Text style={styles.termsLink}>política de privacidade</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={styles.errorText}>{errors.terms}</Text>
              )}

              <Button
                title="Criar conta"
                onPress={handleRegister}
                style={styles.registerButton}
                loading={isLoading}
                disabled={!isFormValid} // Desabilitar botão se o formulário não for válido
                variant="confirm" // Novo estilo de botão de confirmação
              />

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já tem uma conta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
