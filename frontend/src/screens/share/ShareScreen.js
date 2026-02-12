import React, { useState, useEffect } from "react";
import { View, Alert, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles/ShareScreen.style";

// Redux actions
import { generateShareLink, resetShareState, clearAllShareState } from "../../store/shareSlice";

// Componentes
import TabNavigator from "../../components/share/TabNavigator";
import QRCodeTab from "../../components/share/QRCodeTab";
import CollaboratorsList from "../../components/document/CollaboratorsList";

const ShareScreen = ({ route, navigation }) => {
  const { documentId } = route.params || {};
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("collaborators");

  const { loading, shareLink, error } = useSelector((state) => state.share);

  const { user } = useSelector((state) => state.auth);
  const { currentDocument } = useSelector((state) => state.documents);

  // Resetar completamente o estado quando a tela for desmontada
  useEffect(() => {
    return () => {
      dispatch(clearAllShareState());
    };
  }, [dispatch]);
  
  // Resetar apenas o estado de link/QRCode quando o documentId mudar
  useEffect(() => {
    dispatch(resetShareState());
  }, [documentId, dispatch]);

  // Resetar estado quando a tab mudar para QRCode
  useEffect(() => {
    if (activeTab === "qrcode") {
      dispatch(resetShareState());
    }
  }, [activeTab, dispatch]);

  // Atualizar título da tela com nome do documento
  useEffect(() => {
    if (currentDocument) {
      navigation.setOptions({
        title: `Compartilhar: ${currentDocument.title || "Documento"}`,
      });
    }
  }, [currentDocument, navigation]);

  // Gerar token compartilhável e QR Code
  const handleGenerateLink = async (permission = "read") => {
    if (!documentId) {
      Alert.alert("Erro", "ID do documento não encontrado.");
      return;
    }

    try {
      await dispatch(
        generateShareLink({
          documentId,
          options: { permission, expiresIn: "7d" },
        })
      ).unwrap();
    } catch (error) {
      console.error("Erro ao gerar token de compartilhamento:", error);
      Alert.alert(
        "Erro",
        "Não foi possível gerar o token de compartilhamento. Tente novamente."
      );
    }
  };

  // Renderizar o conteúdo baseado na aba selecionada
  const renderContent = () => {
    switch (activeTab) {
      case "collaborators":
        return <CollaboratorsList documentId={documentId} />;
     
      case "qrcode":
        return (
          <QRCodeTab
            documentId={documentId}
            loading={loading}
            shareLink={shareLink}
            currentDocument={currentDocument}
            handleGenerateLink={handleGenerateLink}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TabNavigator activeTab={activeTab} setActiveTab={setActiveTab} />

      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
};

export default ShareScreen;
