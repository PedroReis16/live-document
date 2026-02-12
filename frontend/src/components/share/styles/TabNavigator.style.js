import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 5,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#e3f2fd",
  },
  tabText: {
    marginLeft: 5,
    fontSize: 15,
    color: "#666",
  },
  activeTabText: {
    color: "#2196f3",
    fontWeight: "600",
  },
});