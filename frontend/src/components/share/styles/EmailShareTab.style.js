import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  addCollaboratorContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  emailFormContainer: {
    paddingVertical: 20,
  },
  permissionSelector: {
    marginVertical: 15,
  },
  permissionLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  permissionOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  permissionOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  permissionOptionActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    borderWidth: 1,
  },
  permissionText: {
    fontSize: 14,
    color: "#666",
  },
  permissionTextActive: {
    color: "#2196f3",
    fontWeight: "600",
  },
  emailFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 10,
  },
});