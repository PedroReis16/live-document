import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';

// Screens
import DocumentListScreen from '../screens/documents/DocumentListScreen';
import DocumentEditScreen from '../screens/documents/DocumentEditScreen';
import DocumentViewScreen from '../screens/documents/DocumentViewScreen';
import ShareScreen from '../screens/share/ShareScreen';
import JoinScreen from '../screens/share/JoinScreen';
import QRCodeScannerScreen from '../screens/share/QRCodeScannerScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';

// Componentes de ícones para a tab bar
const DocumentIcon = ({ color }) => <Feather name="file-text" size={24} color={color} />;
const UserIcon = ({ color }) => <Feather name="user" size={24} color={color} />;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DocumentStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DocumentList" 
        component={DocumentListScreen} 
        options={{ 
          title: "Meus Documentos",
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="DocumentEdit" 
        component={DocumentEditScreen}
        options={{ 
          title: "Editar Documento",
          headerBackTitleVisible: false
        }}  
      />
      <Stack.Screen 
        name="DocumentView" 
        component={DocumentViewScreen} 
        options={{ 
          title: "Visualizar Documento",
          headerBackTitleVisible: false
        }}
      />
      <Stack.Screen 
        name="Share" 
        component={ShareScreen} 
        options={{ 
          title: "Compartilhar",
          headerBackTitleVisible: false
        }}
      />
      <Stack.Screen 
        name="Join" 
        component={JoinScreen} 
        options={{ 
          title: "Entrar em Documento",
          headerBackTitleVisible: false
        }}
      />
      <Stack.Screen 
        name="QRCodeScannerScreen" 
        component={QRCodeScannerScreen} 
        options={{ 
          title: "Escanear QR Code",
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2196f3",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 }
        },
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Documents"
        component={DocumentStack}
        options={{
          tabBarLabel: "Documentos",
          tabBarIcon: ({ color }) => <DocumentIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
