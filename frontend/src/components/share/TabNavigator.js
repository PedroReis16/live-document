import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles/TabNavigator.style";

const TabNavigator = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'collaborators', icon: "users", label: "Colaboradores" },
    { id: 'qrcode', icon: "share-2", label: "QR Code" }
  ];

  return (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Feather 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? "#2196f3" : "#666"} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TabNavigator;