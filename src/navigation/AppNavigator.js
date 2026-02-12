import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import MainNavigator from "./MainNavigator";
import AuthNavigator from "./AuthNavigator";
import { restoreAuthState } from "../store/authSlice";
import { processDeepLinkToken } from "../store/shareSlice";
import Loading from "../components/common/Loading";
import StorageService from "../services/storage";
import { Alert } from "react-native";

const AppNavigator = () => {
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    isInitialized,
    loading: authLoading,
    token: reduxToken,
  } = useSelector((state) => state.auth);
  
  const { 
    deepLinkToken,
    loading: shareLoading
  } = useSelector((state) => state.share);
  
  const [initializing, setInitializing] = useState(true);
  const [token, setToken] = useState(reduxToken);
  const [processingDeepLink, setProcessingDeepLink] = useState(false);

  // Efeito para restaurar estado de autenticação
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const tokens = await StorageService.getTokens();
        if (tokens && tokens.accessToken) {
          // Guardar token localmente para usar na conexão do socket
          setToken(tokens.accessToken);
          // Temos tokens armazenados, vamos restaurar o estado
          await dispatch(restoreAuthState()).unwrap();
        }
      } catch (error) {
        console.error("Erro ao restaurar autenticação:", error);
      } finally {
        setInitializing(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  // Processar token de deep link quando disponível e autenticado
  useEffect(() => {
    if (deepLinkToken && isAuthenticated && !processingDeepLink) {
      setProcessingDeepLink(true);
      
      // Processar o token e navegar para o documento correspondente
      dispatch(processDeepLinkToken(deepLinkToken))
        .unwrap()
        .then(result => {
          console.log('Deep link processado com sucesso:', result);
          // A navegação para o documento será feita através do navigatorRef
        })
        .catch(error => {
          console.error('Erro ao processar deep link:', error);
          Alert.alert(
            "Link inválido",
            "O link de compartilhamento é inválido ou expirou.",
            [{ text: "OK" }]
          );
        })
        .finally(() => {
          setProcessingDeepLink(false);
        });
    }
  }, [deepLinkToken, isAuthenticated, dispatch]);

  // Atualizar token quando mudar no Redux
  useEffect(() => {
    if (reduxToken) {
      setToken(reduxToken);
    }
  }, [reduxToken]);

  // Mostrar loading enquanto verifica autenticação
  if (initializing || (authLoading && !isInitialized) || processingDeepLink) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
