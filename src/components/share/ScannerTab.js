import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles/ScannerTab.style";
import Button from "../common/Button";

const ScannerTab = ({ handleOpenScanner }) => {
  return (
    <View style={styles.scanContainer}>
      <Text style={styles.scanTitle}>Escanear QR Code</Text>
      <Text style={styles.scanSubtitle}>
        Use o scanner para acessar documentos compartilhados via QR Code
      </Text>
      <Button
        title="Abrir scanner"
        onPress={handleOpenScanner}
        leftIcon={<Feather name="camera" size={20} color="#fff" />}
        containerStyle={styles.scanButton}
      />
    </View>
  );
};

export default ScannerTab;