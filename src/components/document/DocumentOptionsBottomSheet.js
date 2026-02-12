import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles/DocumentOptionsBottomSheet.style";

const DocumentOptionsBottomSheet = ({
  visible,
  onClose,
  onCreateNew,
  onScanQR,
  onPasteToken,
}) => {
  const [slideAnim] = React.useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>O que você deseja fazer?</Text>

          <TouchableOpacity style={styles.optionButton} onPress={onScanQR}>
            <View style={[styles.iconContainer, styles.scanIconContainer]}>
              <Feather name="camera" size={24} color="#2196f3" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Escanear QR Code</Text>
              <Text style={styles.optionDescription}>
                Escanear QR Code de um documento compartilhado
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={onPasteToken}>
            <View style={[styles.iconContainer, styles.tokenIconContainer]}>
              <Feather name="clipboard" size={24} color="#9c27b0" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Colar token</Text>
              <Text style={styles.optionDescription}>
                Colar um token de compartilhamento da área de transferência
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={onCreateNew}>
            <View style={[styles.iconContainer, styles.newIconContainer]}>
              <Feather name="file-plus" size={24} color="#4caf50" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Criar novo documento</Text>
              <Text style={styles.optionDescription}>
                Iniciar um documento em branco
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DocumentOptionsBottomSheet;
