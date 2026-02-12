// filepath: d:\Documentos\Code\Projetos\document-app\src\screens\share\QRCodeScannerScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Linking,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useDispatch } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles/QRCodeScannerScreen.style";

// Redux actions
import { processDeepLinkToken } from "../../store/shareSlice";

const QRCodeScannerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  // Solicitar permissão para usar a câmera
  useEffect(() => {
    requestCameraPermission();
  }, []);

  // Função para solicitar permissão da câmera
  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
  };

  // Abrir configurações do app para que o usuário habilite a permissão
  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error("Erro ao abrir configurações:", error);
      Alert.alert(
        "Erro",
        "Não foi possível abrir as configurações do aplicativo. Por favor, habilite manualmente a permissão da câmera nas configurações do seu dispositivo."
      );
    }
  };

  // Manipular o resultado da varredura do QR Code
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // O QR Code contém diretamente o token, não precisamos extrair de uma URL
      const token = data.trim();

      // Validar o formato do token (padrão hexadecimal de pelo menos 16 caracteres)
      const isValidTokenFormat = /^[0-9a-f]{16,}$/i.test(token);

      if (isValidTokenFormat) {
        // Processar o token
        await dispatch(processDeepLinkToken(token)).unwrap();
        navigation.goBack(); // Voltar após processar com sucesso
      } else {
        Alert.alert(
          "Formato Inválido",
          "O QR Code não contém um token válido. Verifique se o QR Code pertence ao aplicativo Document.",
          [{ text: "OK", onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      Alert.alert(
        "Erro",
        "Não foi possível processar este QR Code. Tente novamente.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    }
  };

  // Renderizar com base na permissão
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.statusText}>Solicitando acesso à câmera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.permissionContainer}>
          <Feather
            name="camera-off"
            size={60}
            color="#2196f3"
            style={styles.permissionIcon}
          />

          <Text style={styles.statusText}>Sem acesso à câmera</Text>
          <Text style={styles.helpText}>
            É necessário permitir o acesso à câmera para escanear QR Codes e
            compartilhar documentos
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={requestCameraPermission}
            >
              <Text style={styles.buttonText}>Solicitar permissão novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={openAppSettings}
            >
              <Text style={styles.buttonOutlineText}>Abrir Configurações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonOutline, { marginTop: 24 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonOutlineText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <View style={styles.scanWindow}>
          <View style={styles.scanCornerTopLeft} />
          <View style={styles.scanCornerTopRight} />
          <View style={styles.scanCornerBottomLeft} />
          <View style={styles.scanCornerBottomRight} />
        </View>

        <View style={styles.footer}>
          {/* <Text style={styles.footerText}>Aponte a câmera para um QR code</Text> */}

          {scanned && (
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>Escanear novamente</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default QRCodeScannerScreen;
