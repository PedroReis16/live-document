import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  badge: {
    backgroundColor: "#2196f3",
    borderRadius: 12,
    padding: 4,
    marginLeft: 8,
  },
  pendingBadge: {
    backgroundColor: "#ff9800",
  },
  collaboratorsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  collaboratorsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});
