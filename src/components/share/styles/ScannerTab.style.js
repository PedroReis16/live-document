import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scanContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: 300,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  scanSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  scanButton: {
    minWidth: 200,
  },
});