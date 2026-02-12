import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import Loading from "./src/components/common/Loading";
import * as Linking from 'expo-linking';
import 'fast-text-encoding';

const App = () => {
  useEffect(() => {
    // Configurar manipulador de links profundos
    const handleDeepLink = (url) => {
      if (url) {
        const parsedUrl = Linking.parse(url);
        
        // Processar links para compartilhamento de documentos
        // URL esperada: app://document/share/{token}
        if (parsedUrl.path && parsedUrl.path.startsWith('document/share/')) {
          const token = parsedUrl.path.split('/').pop();
          
          // Armazenar o token para ser processado após o carregamento do app
          store.dispatch({
            type: 'share/setDeepLinkToken',
            payload: token
          });
        }
      }
    };

    // Configurar listener para links profundos (API atualizada)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });
    
    // Verificar se o app foi aberto por um link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      // Remover listener ao desmontar
      subscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default App;
