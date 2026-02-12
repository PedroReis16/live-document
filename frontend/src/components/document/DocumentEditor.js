// Editor rico de texto
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Text,
  Animated,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import { updateDocument } from '../../store/documentSlice';
import SocketService from '../../services/socket';
import NetInfo from '@react-native-community/netinfo';
import { debounce } from 'lodash';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles/DocumentEditor.style';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para salvar documentos no storage local
const LOCAL_DOCUMENT_KEY_PREFIX = 'local_document_';

const DocumentEditor = ({ 
  document, 
  readOnly = false, 
  collaborationMode = false,
  onSave 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [isTyping, setIsTyping] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  
  // Animações para o indicador de status
  const saveIconOpacity = useRef(new Animated.Value(0)).current;
  const saveIconScale = useRef(new Animated.Value(0.8)).current;
  const saveIconColor = useRef(new Animated.Value(0)).current;
  
  const auth = useSelector(state => state.auth);
  const collaborationActive = useSelector(state => state.documents.collaborationActive);
  const dispatch = useDispatch();
  
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const lastSyncedContent = useRef('');
  const lastSyncedTitle = useRef('');
  const saveStatusTimeout = useRef(null);
  const lastSaveTime = useRef(null);
  const savePromise = useRef(null);
  const pendingChanges = useRef(null);
  const isSaving = useRef(false);
  
  // Valor interpolado para cor do ícone
  const iconColor = saveIconColor.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#FFB74D', '#4CAF50', '#F44336'] // laranja (salvando) -> verde (salvo) -> vermelho (erro)
  });
  
  // Monitorar conectividade
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Inicializar dados do documento
  useEffect(() => {
    if (document) {
      setTitle(document.title || '');
      setContent(document.content || '');
      lastSyncedContent.current = document.content || '';
      lastSyncedTitle.current = document.title || '';
      
      // Verificar se há uma versão local mais recente do documento
      loadLocalBackup(document.id);
    }
  }, [document?.id]);

  // Gerenciar animação sutil do ícone de salvamento
  useEffect(() => {
    // Cancelar timeout anterior se houver
    if (saveStatusTimeout.current) {
      clearTimeout(saveStatusTimeout.current);
    }
    
    if (saveStatus === 'idle') {
      // Se não estiver salvando, não mostrar nada
      return;
    }
    
    // Configurar valor de cor baseado no status
    let colorValue;
    switch (saveStatus) {
      case 'saving':
        colorValue = 0; // laranja
        break;
      case 'saved':
        colorValue = 0.5; // verde
        break;
      case 'error':
        colorValue = 1; // vermelho
        break;
    }
    
    // Animar a aparição do ícone
    Animated.parallel([
      Animated.timing(saveIconOpacity, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(saveIconScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(saveIconColor, {
        toValue: colorValue,
        duration: 200,
        useNativeDriver: false
      })
    ]).start();
    
    // Ocultar após um determinado tempo, exceto se estiver salvando
    if (saveStatus === 'saved' || saveStatus === 'error') {
      const hideDelay = saveStatus === 'error' ? 2000 : 1000;
      
      saveStatusTimeout.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(saveIconOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(saveIconScale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true
          })
        ]).start(() => {
          // Só redefine para 'idle' após a animação terminar
          setSaveStatus('idle');
        });
      }, hideDelay);
    }
    
    return () => {
      if (saveStatusTimeout.current) {
        clearTimeout(saveStatusTimeout.current);
      }
    };
  }, [saveStatus]);
  
  // Configurar listeners do socket para colaboração
  useEffect(() => {
    if (!collaborationMode || !collaborationActive || !document) return;
    
    // Listener para mudanças no documento de outros usuários
    const unsubscribeChange = SocketService.onDocumentChange(data => {
      // Safety check for missing userId in socket data
      const currentUserId = auth.user?.id || auth.user?.data?._id;
      if (!data || !data.userId || data.userId !== currentUserId) {
        console.log("Received document change from another user:", data?.userId || "unknown");
        
        // Only proceed if we have valid changes
        if (data && data.changes) {
          // Atualizar título ou conteúdo recebido de outros usuários
          if (data.changes.title !== undefined) {
            setTitle(data.changes.title);
            lastSyncedTitle.current = data.changes.title;
          }
          
          if (data.changes.content !== undefined) {
            setContent(data.changes.content);
            lastSyncedContent.current = data.changes.content;
          }
        }
      }
    });
    
    // Listener para eventos de digitação de outros usuários
    const unsubscribeTyping = SocketService.onUserTyping(data => {
      // Safety check for missing userId in socket data
      const currentUserId = auth.user?.id || auth.user?.data?._id;
      if (data && data.userId && data.userId !== currentUserId) {
        setIsTyping(prev => ({
          ...prev,
          [data.userId]: {
            isTyping: true,
            timestamp: Date.now()
          }
        }));
        
        // Limpar status de digitação após 2 segundos
        setTimeout(() => {
          setIsTyping(prev => ({
            ...prev,
            [data.userId]: {
              isTyping: false,
              timestamp: Date.now()
            }
          }));
        }, 2000);
      }
    });
    
    // Listener para usuários entrando na colaboração
    const unsubscribeJoin = SocketService.onCollaboratorJoined(data => {
      // Only process if we have valid user data
      if (data && data.user && data.user.id) {
        setCollaborators(prev => {
          // Verificar se já existe
          const exists = prev.some(c => c.id === data.user.id);
          if (!exists) {
            return [...prev, { ...data.user, status: 'online' }];
          }
          return prev.map(c => 
            c.id === data.user.id 
              ? { ...c, status: 'online' } 
              : c
          );
        });
      }
    });
    
    // Listener para usuários saindo da colaboração
    const unsubscribeLeave = SocketService.onCollaboratorLeft(data => {
      // Only process if we have a valid user ID
      if (data && data.userId) {
        setCollaborators(prev => 
          prev.map(c => 
            c.id === data.userId 
              ? { ...c, status: 'offline' } 
              : c
          )
        );
      }
    });
    
    // Limpar listeners ao desmontar
    return () => {
      unsubscribeChange();
      unsubscribeTyping();
      unsubscribeJoin();
      unsubscribeLeave();
    };
  }, [collaborationMode, collaborationActive, document, auth.user?.id]);
  
  // Salvar backup local do documento (não bloqueante)
  const saveLocalBackup = (docId, docData) => {
    if (!docId) return;
    
    // Não bloqueie - apenas execute em segundo plano
    (async () => {
      try {
        const localData = {
          ...docData,
          localUpdatedAt: new Date().toISOString()
        };
        
        await AsyncStorage.setItem(
          `${LOCAL_DOCUMENT_KEY_PREFIX}${docId}`, 
          JSON.stringify(localData)
        );
        
        console.log('Backup local salvo com sucesso');
      } catch (error) {
        console.error('Erro ao salvar backup local:', error);
      }
    })();
  };
  
  // Carregar backup local do documento
  const loadLocalBackup = async (docId) => {
    if (!docId) return;
    
    try {
      const localDataJson = await AsyncStorage.getItem(`${LOCAL_DOCUMENT_KEY_PREFIX}${docId}`);
      
      if (localDataJson) {
        const localData = JSON.parse(localDataJson);
        
        // Verificar se a versão local é mais recente que a do servidor
        const serverUpdatedAt = new Date(document.updatedAt || 0).getTime();
        const localUpdatedAt = new Date(localData.localUpdatedAt || 0).getTime();
        
        if (localUpdatedAt > serverUpdatedAt) {
          // A versão local é mais recente, perguntar ao usuário
          Alert.alert(
            'Versão local disponível',
            'Encontramos uma versão local mais recente deste documento. Deseja carregar essa versão?',
            [
              {
                text: 'Não, usar versão do servidor',
                style: 'cancel'
              },
              {
                text: 'Sim, usar versão local',
                onPress: () => {
                  if (localData.title) {
                    setTitle(localData.title);
                  }
                  if (localData.content) {
                    setContent(localData.content);
                  }
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Erro ao carregar backup local:', error);
    }
  };
  
  // Função para processar o salvamento em background sem interromper a UI
  const processActualSave = async () => {
    // Se já estiver salvando, apenas armazene as mudanças pendentes
    if (isSaving.current) {
      return;
    }
    
    // Se não houver mudanças pendentes, não faça nada
    if (!pendingChanges.current) {
      return;
    }
    
    const docId = document?.id;
    if (!docId) return;
    
    const changes = { ...pendingChanges.current };
    pendingChanges.current = null; // Limpar as mudanças pendentes
    
    isSaving.current = true;
    setSaveStatus('saving');
    
    try {
      // Salvar localmente primeiro (não bloqueante)
      saveLocalBackup(docId, changes);
      
      if (isOnline) {
        // Salvamento na API de forma não bloqueante
        await dispatch(updateDocument({ id: docId, changes })).unwrap();
        
        // Atualizar referências somente após conclusão do salvamento
        if (changes.title !== undefined) {
          lastSyncedTitle.current = changes.title;
        }
        
        if (changes.content !== undefined) {
          lastSyncedContent.current = changes.content;
        }
        
        setSaveStatus('saved');
      } else {
        // Se estiver offline, apenas notificar que foi salvo localmente
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      setSaveStatus('error');
    } finally {
      isSaving.current = false;
      
      // Se novas mudanças foram feitas durante o salvamento, processar novamente
      if (pendingChanges.current) {
        setTimeout(processActualSave, 100); // Pequeno atraso para evitar bloqueio da UI
      }
    }
  };
  
  // Debounce para acumular mudanças sem sobrecarregar a API
  const debouncedSave = useRef(
    debounce((docId, changes) => {
      // Apenas registre as mudanças pendentes
      pendingChanges.current = {
        ...pendingChanges.current,
        ...changes
      };
      
      // Inicie o processamento em background
      setTimeout(processActualSave, 0);
    }, 1000)
  ).current;
  
  // Emitir mudança para colaboração em tempo real (não aguarda debounce)
  const emitChange = (changes) => {
    if (!collaborationMode || !collaborationActive || !document) return;
    
    try {
      console.log("Emitindo alterações via socket:", changes);
      
      // Adicionar informações completas ao objeto de alterações
      const currentUserId = auth.user?.id || auth.user?.data?._id;
      const userName = auth.user?.name || auth.user?.username || "Usuário";
      
      // Verificar se o socket está conectado
      if (!SocketService.isSocketConnected()) {
        console.warn("Socket não está conectado. Tentando reconectar antes de enviar alterações...");
        
        // Tentar reconectar - nota: isso é assíncrono mas continuamos o fluxo
        try {
          SocketService.reconnect()
            .then(connected => {
              console.log("Tentativa de reconexão do socket resultou em:", connected ? "conectado" : "falha");
              if (connected) {
                // Se reconectou com sucesso, tentar enviar novamente
                setTimeout(() => {
                  console.log("Tentando enviar alterações novamente após reconexão");
                  SocketService.emitDocumentChange(document.id, changes);
                }, 500);
              }
            })
            .catch(err => console.error("Erro na reconexão:", err));
        } catch (reconnectError) {
          console.error("Erro ao tentar reconectar socket:", reconnectError);
        }
      }
      
      // Enviar alterações para outros usuários via socket
      console.log(`Emitindo alterações para documento ${document.id}:`, changes);
      SocketService.emitDocumentChange(document.id, changes);
      
      // Notificar que está digitando para mostrar indicador aos outros usuários
      SocketService.emitUserTyping(document.id);
      
      console.log("Alterações emitidas com sucesso");
    } catch (error) {
      console.error("Erro ao emitir alterações via socket:", error);
    }
  };
  
  // Handler de mudança de título (totalmente não bloqueante)
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    
    // Apenas emitir mudanças em colaboração, NÃO atualizar o Redux a cada tecla
    if (collaborationMode && collaborationActive) {
      emitChange({ title: newTitle });
    }
    
    // Salvar com debounce (apenas localmente)
    if (!readOnly && document?.id) {
      debouncedSave(document.id, { title: newTitle, content });
    }
  };
  
  // Handler de mudança de conteúdo (totalmente não bloqueante)
  const handleContentChange = (newContent) => {
    setContent(newContent);
    
    // Apenas emitir mudanças em colaboração, NÃO atualizar o Redux a cada tecla
    if (collaborationMode && collaborationActive) {
      emitChange({ content: newContent });
    }
    
    // Salvar com debounce (apenas localmente)
    if (!readOnly && document?.id) {
      debouncedSave(document.id, { title, content: newContent });
    }
  };
  
  // Salvar documento manualmente (forçar salvamento imediato)
  const handleSave = () => {
    if (readOnly || !document?.id) return;
    
    const changes = {
      title,
      content
    };
    
    // Usar o mesmo mecanismo não-bloqueante
    pendingChanges.current = { ...changes };
    processActualSave();
    
    // Se for um documento local, delegamos ao componente pai usando o mesmo processo não-bloqueante
    if (document.id.startsWith('local_') && onSave) {
      setTimeout(() => {
        onSave(changes);
      }, 0);
    }
  };
  
  // Renderizar o indicador sutil de status
  const renderSaveStatusIcon = () => {
    if (saveStatus === 'idle') return null;
    
    let iconName;
    
    switch (saveStatus) {
      case 'saving':
        iconName = 'save';
        break;
      case 'saved':
        iconName = 'check';
        break;
      case 'error':
        iconName = 'alert-circle';
        break;
      default:
        return null;
    }
    
    return (
      <Animated.View 
        style={[
          styles.saveStatusIconContainer, 
          { 
            opacity: saveIconOpacity,
            transform: [{ scale: saveIconScale }]
          }
        ]}
      >
        <Animated.View style={{ backgroundColor: iconColor, ...styles.saveStatusIconBg }} />
        <Feather name={iconName} size={16} color="#fff" />
      </Animated.View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Status do documento e indicador de salvamento */}
      {renderSaveStatusIcon()}
      
      {!isOnline && (
        <View style={styles.offlineIndicatorMini}>
          <Feather name="wifi-off" size={12} color="#fff" />
        </View>
      )}
      
      {/* Conteúdo do documento */}
      <TextInput
        ref={titleInputRef}
        style={styles.titleInput}
        value={title}
        onChangeText={handleTitleChange}
        placeholder="Título do documento"
        placeholderTextColor="#999"
        editable={!readOnly}
      />
      
      <TextInput
        ref={contentInputRef}
        style={styles.contentInput}
        value={content}
        onChangeText={handleContentChange}
        placeholder="Comece a digitar aqui..."
        placeholderTextColor="#999"
        multiline
        textAlignVertical="top"
        editable={!readOnly}
      />
      
      {/* Indicador de colaboração */}
      {collaborationMode && collaborationActive && collaborators.filter(c => c.status === 'online').length > 0 && (
        <View style={styles.collaborationIndicatorMini}>
          <Feather name="users" size={12} color="#fff" />
          <Text style={styles.collaborationTextMini}>
            {collaborators.filter(c => c.status === 'online').length}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default DocumentEditor;
