import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { styles } from './styles/JoinScreen.style';

// Redux actions
import { joinSharedDocument } from '../../store/shareSlice';

// Componentes
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const JoinScreen = ({ navigation }) => {
  const [shareCode, setShareCode] = useState('');
  const [isValidCode, setIsValidCode] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.share);
  
  // Validar código enquanto o usuário digita
  const handleCodeChange = (code) => {
    setShareCode(code);
    
    // Validação simples: verifica se o código tem pelo menos 6 caracteres
    setIsValidCode(code.trim().length >= 6);
  };
  
  // Limpar o código
  const handleClearCode = () => {
    setShareCode('');
    setIsValidCode(false);
  };
  
  // Colar código da área de transferência
  const handlePasteCode = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent) {
        setShareCode(clipboardContent.trim());
        setIsValidCode(clipboardContent.trim().length >= 6);
      }
    } catch (error) {
      console.error('Erro ao acessar a área de transferência:', error);
    }
  };

  // Navegar para o scanner QR Code
  const handleScanQRCode = () => {
    navigation.navigate('QRCodeScannerScreen');
  };
  
  // Entrar no documento compartilhado
  const handleJoinDocument = async () => {
    if (!isValidCode) {
      Alert.alert('Código inválido', 'Por favor, insira um código válido para continuar.');
      return;
    }
    
    try {
      const result = await dispatch(joinSharedDocument(shareCode)).unwrap();
      
      // Se for bem-sucedido, navegar para a tela de edição do documento
      navigation.navigate('DocumentEditScreen', {
        documentId: result.documentId,
        isSharedDocument: true
      });
      
      // Limpar código após sucesso
      setShareCode('');
    } catch (error) {
      console.error('Erro ao entrar no documento compartilhado:', error);
      Alert.alert(
        'Erro',
        error || 'Não foi possível entrar no documento. Verifique o código e tente novamente.'
      );
    }
  };
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Feather name="share-2" size={64} color="#2196f3" />
          </View>
          
          <Text style={styles.title}>Entrar em um documento</Text>
          <Text style={styles.subtitle}>
            Insira o código de compartilhamento ou escaneie o QR Code para acessar um documento
          </Text>
          
          <View style={styles.formContainer}>
            <Input
              label="Código de compartilhamento"
              placeholder="Insira o código"
              value={shareCode}
              onChangeText={handleCodeChange}
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.inputContainer}
              rightIcon={
                shareCode ? (
                  <TouchableOpacity onPress={handleClearCode}>
                    <Feather name="x" size={24} color="#666" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handlePasteCode}>
                    <Feather name="clipboard" size={24} color="#666" />
                  </TouchableOpacity>
                )
              }
            />
            
            <Button
              title="Entrar no documento"
              onPress={handleJoinDocument}
              disabled={!isValidCode || loading}
              loading={loading}
            />

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>ou</Text>
              <View style={styles.orLine} />
            </View>

            <Button
              title="Escanear QR Code"
              onPress={handleScanQRCode}
              type="outline"
              leftIcon={<Feather name="camera" size={20} color="#2196f3" />}
              containerStyle={styles.scanButton}
            />
            
            {error && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}
          </View>
          
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Como conseguir um código?</Text>
            <Text style={styles.helpText}>
              Peça ao proprietário do documento para gerar e compartilhar um código de acesso ou QR Code com você.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default JoinScreen;
