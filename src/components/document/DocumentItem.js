import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles/DocumentItem.style";
import { formatToLocalDateTime } from "../../utils/helpers"; // Certifique-se de ter essa função utilitária

// Item da lista de documentos
const DocumentItem = ({ document, onLongPress, onDelete, onShare }) => {
  const navigation = useNavigation();

  // Garantir que o documento tenha um ID acessível
  const docId = document?.id || document?._id;

  // Abrir documento para visualização
  const handlePress = () => {
    if (!docId) {
      console.error("ID do documento não encontrado:", document);
      return;
    }

    navigation.navigate("DocumentView", {
      documentId: docId,
      isSharedDocument: document.shared || document.isShared || false,
    });
  };

  // Abrir menu de compartilhamento
  const handleShare = () => {
    if (!docId) {
      console.error("ID do documento não encontrado:", document);
      return;
    }

    if (typeof onShare === "function") {
      onShare({ ...document, id: docId });
    } else {
      // Navegar diretamente para a tela de compartilhamento se não houver handler
      navigation.navigate("Share", { documentId: docId });
    }
  };

  // Deletar documento
  const handleDelete = () => {
    if (!docId) {
      console.error("ID do documento não encontrado:", document);
      return;
    }

    if (typeof onDelete === "function") {
      onDelete({ ...document, id: docId });
    }
  };

  // Se não houver documento ou ID válido, não renderizar nada
  if (!document || !docId) {
    console.warn("Documento inválido recebido por DocumentItem:", document);
    return null;
  }

  // Determinar se o documento é compartilhado (verifica ambas propriedades)
  const isShared = document.shared || document.isShared || false;

  return (
    <TouchableOpacity
      key={docId}
      style={styles.container}
      onPress={handlePress}
      onLongPress={() => onLongPress && onLongPress({ ...document, id: docId })}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Feather
          name={isShared ? "file-plus" : "file-text"}
          size={24}
          color={isShared ? "#2196f3" : "#666"}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {document.title || "Documento sem título"}
          </Text>

          {isShared && (
            <View style={styles.badge}>
              <Feather name="users" size={12} color="#fff" />
            </View>
          )}

          {document.syncStatus === "pending" && (
            <View style={[styles.badge, styles.pendingBadge]}>
              <Feather name="clock" size={12} color="#fff" />
            </View>
          )}
        </View>

        <Text style={styles.date} numberOfLines={1}>
          {document.createdAt
            ? `Criado em: ${formatToLocalDateTime(document.createdAt)}`
            : "Data desconhecida"}
        </Text>

        <Text style={styles.date} numberOfLines={1}>
          {document.updatedAt
            ? `Última edição: ${formatToLocalDateTime(document.updatedAt)}`
            : ""}
        </Text>

        {document.collaborators && document.collaborators.length > 0 && (
          <View style={styles.collaboratorsContainer}>
            <Feather name="users" size={14} color="#666" />
            <Text style={styles.collaboratorsText}>
              {document.collaborators.length} colaborador
              {document.collaborators.length > 1 ? "es" : ""}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          key={`share-${docId}`}
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Feather name="share-2" size={20} color="#2196f3" />
        </TouchableOpacity>

        {!isShared && (
          <TouchableOpacity
            key={`delete-${docId}`}
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={20} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default DocumentItem;
