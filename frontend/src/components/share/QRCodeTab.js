import React, { useState, useEffect } from "react";
import { View, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { styles } from "./styles/QRCodeTab.style";
import Button from "../common/Button";

const QRCodeTab = ({
  documentId,
  loading,
  shareLink,
  currentDocument,
  handleGenerateLink,
}) => {
  const [selectedPermission, setSelectedPermission] = useState("read");

  const permissions = [
    { value: "read", label: "Leitura", icon: "eye" },
    { value: "write", label: "Edição", icon: "edit-2" },
    { value: "admin", label: "Administrador", icon: "shield" },
  ];

  // Reset da permissão selecionada quando o link muda ou é removido
  useEffect(() => {
    if (!shareLink) {
      setSelectedPermission("read");
    }
  }, [shareLink]);

  // Gerar token com permissão selecionada
  const generateLinkWithPermission = () => {
    handleGenerateLink(selectedPermission);
  };

  // Gerar novo token com permissão diferente
  const generateNewLink = () => {
    handleGenerateLink(selectedPermission);
  };

  // Função para copiar o token para a área de transferência
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(shareLink);
      Alert.alert("Sucesso", "Token copiado para a área de transferência.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar o token.");
    }
  };

  if (!shareLink) {
    return (
      <View style={styles.noQrCodeContainer}>
        <Text style={styles.noQrCodeText}>
          Gere um token de compartilhamento para criar um QR Code
        </Text>

        <View style={styles.permissionsContainer}>
          <Text style={styles.permissionTitle}>
            Selecione a permissão de acesso:
          </Text>
          <View style={styles.permissionOptions}>
            {permissions.map((permission) => (
              <TouchableOpacity
                key={permission.value}
                style={[
                  styles.permissionOption,
                  selectedPermission === permission.value &&
                    styles.selectedPermission,
                ]}
                onPress={() => setSelectedPermission(permission.value)}
              >
                <Feather
                  name={permission.icon}
                  size={20}
                  color={
                    selectedPermission === permission.value ? "#2196f3" : "#666"
                  }
                />
                <Text
                  style={[
                    styles.permissionLabel,
                    selectedPermission === permission.value &&
                      styles.selectedPermissionLabel,
                  ]}
                >
                  {permission.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Gerar token compartilhável"
          onPress={generateLinkWithPermission}
          loading={loading}
          disabled={loading}
          containerStyle={styles.generateButton}
          leftIcon={<Feather name="key" size={20} color="#fff" />}
        />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.qrContainer}>
        <View style={styles.qrCodeHeaderContainer}>
          <Feather name="camera" size={48} color="#2196f3" />
          <Text style={styles.codeHeader}>QR Code de compartilhamento</Text>
          <Text style={styles.codeSubheader}>
            Escaneie o QR Code abaixo para acessar este documento
          </Text>
        </View>

        <View style={styles.qrCodeWrapper}>
          <QRCode value={shareLink} size={200} />
        </View>

        <View style={styles.linkContainer}>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={styles.linkText}
          >
            {shareLink}
          </Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Feather name="copy" size={20} color="#2196f3" />
          </TouchableOpacity>
        </View>

        <View style={styles.newLinkContainer}>
          <Text style={styles.newLinkTitle}>Alterar permissões do token:</Text>

          <View style={styles.permissionOptions}>
            {permissions.map((permission) => (
              <TouchableOpacity
                key={permission.value}
                style={[
                  styles.permissionOption,
                  selectedPermission === permission.value &&
                    styles.selectedPermission,
                ]}
                onPress={() => setSelectedPermission(permission.value)}
              >
                <Feather
                  name={permission.icon}
                  size={18}
                  color={
                    selectedPermission === permission.value ? "#2196f3" : "#666"
                  }
                />
                <Text
                  style={[
                    styles.permissionLabel,
                    selectedPermission === permission.value &&
                      styles.selectedPermissionLabel,
                  ]}
                >
                  {permission.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Gerar novo token"
            onPress={generateNewLink}
            loading={loading}
            disabled={loading}
            type="outline"
            containerStyle={styles.generateNewButton}
            leftIcon={<Feather name="refresh-cw" size={18} color="#2196f3" />}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default QRCodeTab;
