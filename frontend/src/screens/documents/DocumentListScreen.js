import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { styles } from "./styles/DocumentListScreen.style";
import * as Clipboard from "expo-clipboard";

// Components
import DocumentItem from "../../components/document/DocumentItem";
import Button from "../../components/common/Button";
import DocumentOptionsBottomSheet from "../../components/document/DocumentOptionsBottomSheet";

// Actions
import {
  fetchDocuments,
  deleteDocument,
  createDocument,
} from "../../store/documentSlice";
import { joinByShareToken } from "../../store/shareSlice";

// Services
const DocumentListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { documents, loading } = useSelector((state) => state.documents);

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'my', 'shared'
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [showOptionsBottomSheet, setShowOptionsBottomSheet] = useState(false);

  // Efeito para filtrar documentos baseado na busca e aba ativa
  useEffect(() => {
    // Verificar se documents existe e é um array
    if (documents && Array.isArray(documents)) {
      console.log(
        `Filtrando ${documents.length} documentos com texto: "${searchText}", aba: ${activeTab}`
      );
      let filtered = [...documents];

      // Filtrar por texto de busca
      if (searchText) {
        filtered = filtered.filter((doc) =>
          doc.title.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // Filtrar por tipo (meus ou compartilhados)
      if (activeTab === "my") {
        filtered = filtered.filter((doc) => !doc.shared);
      } else if (activeTab === "shared") {
        filtered = filtered.filter((doc) => doc.shared);
      }

      // Ordenar por data de atualização (mais recentes primeiro)
      filtered.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      console.log(`Resultado da filtragem: ${filtered.length} documentos`);
      setFilteredDocuments(filtered);
    } else {
      // Se documents não for um array válido, inicializar filteredDocuments como array vazio
      console.warn("Documents não é um array válido:", documents);
      setFilteredDocuments([]);
    }
  }, [documents, searchText, activeTab]);

  // Carregar documentos ao montar o componente
  useEffect(() => {
    loadDocuments();
  }, []);

  // Função para carregar documentos
  const loadDocuments = async () => {
    setRefreshing(true);
    try {
      const result = await dispatch(fetchDocuments()).unwrap();
      console.log("Documentos carregados:", result);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar seus documentos. Tente novamente."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Abrir o menu de opções
  const handleOpenOptions = () => {
    setShowOptionsBottomSheet(true);
  };

  // Fechar o menu de opções
  const handleCloseOptions = () => {
    setShowOptionsBottomSheet(false);
  };

  // Navegar para o scanner de QR Code
  const handleScanQRCode = () => {
    setShowOptionsBottomSheet(false);
    navigation.navigate("QRCodeScannerScreen");
  };

  // Função para colar token de compartilhamento da área de transferência
  const handlePasteToken = async () => {
    setShowOptionsBottomSheet(false);

    try {
      // Obter conteúdo da área de transferência
      const clipboardContent = await Clipboard.getStringAsync();

      if (!clipboardContent) {
        Alert.alert(
          "Área de transferência vazia",
          "Não há conteúdo na área de transferência."
        );
        return;
      }
      // Mostrar indicador de carregamento
      setRefreshing(true);

      // Processar o token
      const result = await dispatch(joinByShareToken(shareToken)).unwrap();

      if (result && result.documentId) {
        navigation.navigate("DocumentView", {
          documentId: result.documentId,
          isSharedDocument: true,
        });
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível acessar o documento com esse token."
        );
      }
    } catch (error) {
      console.error("Erro ao processar token:", error);
      let errorMessage =
        "Não foi possível processar o token. Verifique se o token é válido.";

      if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Função para criar novo documento
  const handleCreateDocument = async () => {
    setShowOptionsBottomSheet(false);

    try {
      // Use token from the auth state that was already retrieved at component level
      if (!user) {
        Alert.alert(
          "Erro de autenticação",
          "Você precisa estar autenticado para criar documentos."
        );
        return;
      }

      // Criar documento vazio e navegar para a tela de edição
      const newDocument = {
        title: "Novo documento",
        content: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id,
      };

      // Tentar criar no servidor usando dispatch do Redux
      try {
        const createdDoc = await dispatch(createDocument(newDocument)).unwrap();

        console.log("Documento criado:", createdDoc);

        navigation.navigate("DocumentEdit", {
          documentId: createdDoc.data?._id || createdDoc.data?.id,
          isSharedDocument: false,
          isNewDocument: true,
          documentData: createdDoc.data,
        });
      } catch (error) {
        console.error("Erro ao criar documento:", error);

        // Fallback: usar documento local em caso de erro
        Alert.alert(
          "Erro no servidor",
          "Não foi possível salvar o documento no servidor. Deseja continuar com uma versão local?",
          [
            {
              text: "Não",
              style: "cancel",
            },
            {
              text: "Sim",
              onPress: () => {
                const localDoc = {
                  ...newDocument,
                  id: `local_${Date.now()}`,
                };
                navigation.navigate("DocumentEdit", {
                  documentId: localDoc.id,
                  isNewDocument: true,
                  documentData: localDoc,
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Erro geral ao criar documento:", error);
      Alert.alert(
        "Erro",
        "Não foi possível criar o documento. Verifique sua conexão e tente novamente."
      );
    }
  };

  // Função para lidar com o clique em um documento
  const handleDocumentPress = (document) => {
    const documentId = document.id || document._id;
    navigation.navigate("DocumentView", {
      documentId: documentId,
      isSharedDocument: document.shared || false,
    });
  };

  // Função para compartilhar documento
  const handleShareDocument = (document) => {
    const documentId = document.id || document._id;
    navigation.navigate("Share", { documentId: documentId });
  };

  // Função para excluir documento
  const handleDeleteDocument = (document) => {
    const documentId = document.id || document._id;
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
              Alert.alert("Sucesso", "Documento excluído com sucesso.");
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

  // Renderizar um item da lista
  const renderItem = ({ item }) => (
    <DocumentItem
      document={item}
      onLongPress={handleDocumentPress}
      onDelete={handleDeleteDocument}
      onShare={handleShareDocument}
    />
  );

  // Renderizar componente de estado vazio
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.emptyText}>Carregando documentos...</Text>
        </View>
      );
    }

    let message = "Você não possui documentos.";
    if (activeTab === "shared") {
      message = "Não há documentos compartilhados com você.";
    } else if (searchText) {
      message = "Nenhum documento encontrado com esse termo.";
    }

    return (
      <View style={styles.emptyContainer}>
        <Feather name="file-text" size={64} color="#ccc" />
        <Text style={styles.emptyText}>{message}</Text>
        {activeTab !== "shared" && (
          <Button
            title="Criar novo documento"
            onPress={handleOpenOptions}
            style={styles.createButton}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Documentos</Text>
        </View>

        {/* Campo de busca */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar documentos..."
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="always"
          />
          {searchText !== "" && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Abas de filtro */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "all" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "my" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("my")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "my" && styles.activeTabText,
              ]}
            >
              Meus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "shared" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("shared")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "shared" && styles.activeTabText,
              ]}
            >
              Compartilhados
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de documentos */}
        <FlatList
          data={filteredDocuments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item._id || String(Math.random())}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadDocuments}
              colors={["#2196f3"]}
              tintColor="#2196f3"
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />

        {/* BottomSheet de opções */}
        <DocumentOptionsBottomSheet
          visible={showOptionsBottomSheet}
          onClose={handleCloseOptions}
          onCreateNew={handleCreateDocument}
          onScanQR={handleScanQRCode}
          onPasteToken={handlePasteToken}
        />

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleOpenOptions}
        >
          <Feather name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DocumentListScreen;
