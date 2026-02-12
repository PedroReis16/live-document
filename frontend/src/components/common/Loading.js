import React from "react";
import { Modal, View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { styles } from "./styles/Loading.style";

// Componente de loading global
const Loading = ({ visible = false, text = "Carregando..." }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Loading;
