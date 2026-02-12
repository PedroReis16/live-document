import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2196f3",
  },
  secondaryButton: {
    backgroundColor: "#9c27b0",
  },
  dangerButton: {
    backgroundColor: "#f44336",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2196f3",
  },
  confirmButton: {
    backgroundColor: "#4caf50", // Verde para botões de confirmação
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#e0e0e0",
    borderColor: "#e0e0e0",
    shadowColor: "transparent",
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  outlineText: {
    color: "#2196f3",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
