import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  noQrCodeContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  noQrCodeText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  generateButton: {
    minWidth: 200,
  },
  qrContainer: {
    alignItems: "center",
    padding: 20,
  },
  qrCodeHeaderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  codeHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 10,
    marginBottom: 6,
    textAlign: "center",
  },
  codeSubheader: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 24,
  },
  qrCodeActions: {
    marginVertical: 20,
  },
  // Estilo atualizado para o container de link com botão de cópia
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    marginVertical: 20,
    width: "90%",
  },
  linkTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  // Estilo atualizado para o texto do link
  linkText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  linkActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  linkButton: {
    marginHorizontal: 5,
  },
  copyButton: {
    padding: 10,
  },
  // Estilos para a área de permissões
  permissionsContainer: {
    width: "100%",
    marginVertical: 20,
  },
  permissionTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  permissionOption: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: 80,
  },
  selectedPermission: {
    borderColor: "#2196f3",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  permissionLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  selectedPermissionLabel: {
    color: "#2196f3",
    fontWeight: "600",
  },
  // Estilos para o container de novo link
  newLinkContainer: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginVertical: 15,
  },
  newLinkTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  generateNewButton: {
    marginTop: 16,
  },
  // Novo estilo para o toggle de token
  tokenToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
});