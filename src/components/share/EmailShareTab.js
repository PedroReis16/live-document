import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles/EmailShareTab.style";
import Button from "../common/Button";
import Input from "../common/Input";

const EmailShareTab = ({ 
  documentId, 
  loading, 
  handleShareWithUser 
}) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Compartilhar com usuário por email
  const onShareWithUser = async () => {
    if (!email || !documentId) return;

    try {
      await handleShareWithUser({
        email,
        permission
      });
      
      setEmail("");
      setShowEmailInput(false);
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  if (!showEmailInput) {
    return (
      <View style={styles.addCollaboratorContainer}>
        <Text style={styles.sectionHeader}>Compartilhar por e-mail</Text>
        <Button
          title="Adicionar colaborador"
          onPress={() => setShowEmailInput(true)}
          type="outline"
          leftIcon={<Feather name="user-plus" size={20} color="#2196f3" />}
        />
      </View>
    );
  }

  return (
    <View style={styles.emailFormContainer}>
      <Text style={styles.sectionHeader}>Compartilhar por e-mail</Text>
      
      <Input
        placeholder="email@exemplo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail"
      />
      
      <View style={styles.permissionSelector}>
        <Text style={styles.permissionLabel}>Permissão:</Text>
        <View style={styles.permissionOptions}>
          <TouchableOpacity
            style={[
              styles.permissionOption,
              permission === "read" && styles.permissionOptionActive,
            ]}
            onPress={() => setPermission("read")}
          >
            <Text
              style={[
                styles.permissionText,
                permission === "read" && styles.permissionTextActive,
              ]}
            >
              Leitura
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.permissionOption,
              permission === "write" && styles.permissionOptionActive,
            ]}
            onPress={() => setPermission("write")}
          >
            <Text
              style={[
                styles.permissionText,
                permission === "write" && styles.permissionTextActive,
              ]}
            >
              Edição
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.permissionOption,
              permission === "admin" && styles.permissionOptionActive,
            ]}
            onPress={() => setPermission("admin")}
          >
            <Text
              style={[
                styles.permissionText,
                permission === "admin" && styles.permissionTextActive,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.emailFormActions}>
        <Button
          title="Cancelar"
          onPress={() => {
            setShowEmailInput(false);
            setEmail("");
          }}
          type="text"
          containerStyle={styles.cancelButton}
        />
        <Button
          title="Compartilhar"
          onPress={onShareWithUser}
          loading={loading}
          disabled={!email || loading}
        />
      </View>
    </View>
  );
};

export default EmailShareTab;