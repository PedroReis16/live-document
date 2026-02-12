import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles/DocumentViewScreen.style";

// Serviços
import DocumentService from "../../services/documents";
import { formatToLocalDateTime } from "../../utils/helpers";
import Button from "../../components/common/Button";

import { deleteDocument } from "../../store/documentSlice";

const DocumentViewScreen = ({ route, navigation }) => {
  const { documentId } = route.params || {};
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar documento ao montar o componente
  useEffect(() => {
    if (!documentId) {
      setError("ID do documento não fornecido");
      setLoading(false);
      return;
    }

    loadDocument();
  }, [documentId]);

  // Configurar opções de navegação dinâmicas
  useEffect(() => {
    if (document) {
      console.log("Documento carregado:", document);
      console.log(user.id);

      navigation.setOptions({
        title: "Detalhes do arquivo",
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Feather name="share-2" size={22} color="#2196f3" />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [document, navigation]);

  // Carregar dados do documento
  const loadDocument = async () => {
    try {
      setLoading(true);
      const data = await DocumentService.getDocument(documentId);
      setDocument(data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar documento:", err);
      setError("Não foi possível carregar o documento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para editar o documento
  const handleEdit = () => {
    navigation.navigate("DocumentEdit", {
      documentId: documentId,
      isSharedDocument: document.isShared,
      docUserId: document.ownerId,
    });
  };

  //Função para excluir o documento
  const handleDelete = () => {
    Alert.alert(
      "Excluir documento",
      `Tem certeza que deseja excluir "${document.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteDocument(documentId)).unwrap();
              navigation.navigate("DocumentList");
            } catch (error) {
              console.error("Erro ao excluir documento:", error);
              Alert.alert(
                "Erro",
                "Não foi possível excluir o documento. Tente novamente."
              );
            }
          },
        },
      ]
    );
  };

  // Função para compartilhar o documento
  const handleShare = () => {
    if (document.ownerId === user?.id) {
      // Se for o dono do documento, navega para a tela de compartilhamento
      navigation.navigate("Share", { documentId: document.id });
    } else {
      // Se for um documento compartilhado, compartilha um link externo
      Share.share({
        message: `Confira este documento: "${document.title}"`,
        url: `app://document/${document.id}`,
      });
    }
  };

  // Renderiza mensagem de erro
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDocument}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Renderiza indicador de carregamento
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>Carregando documento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Verifica se o documento existe
  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="file-minus" size={48} color="#f44336" />
          <Text style={styles.errorText}>
            Documento não encontrado ou você não tem permissão para acessá-lo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderiza o documento
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Informações do documento */}
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Criado por:{" "}
              {document.ownerId === user?.id ? "Você" : document.userName}
            </Text>
            {<Text style={styles.metaDot}>•</Text>}
            <Text style={styles.metaText}>
              Última atualização: {formatToLocalDateTime(document.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Conteúdo do documento */}
        <View style={styles.documentContent}>
          <Text style={styles.contentText}>
            {document.content || "Este documento está vazio."}
          </Text>
        </View>

        {/* Barra de ações */}
        <View style={styles.actionBar}>
          {document.ownerId === user?.id && (
            <Button
              title="Excluir"
              icon={<Feather name="trash" size={20} color="#fff" />}
              onPress={handleDelete}
              variant="danger"
            />
          )}

          <Button
            title="Editar"
            icon={<Feather name="edit-2" size={20} color="#fff" />}
            onPress={handleEdit}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentViewScreen;
