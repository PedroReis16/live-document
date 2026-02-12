import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Switch,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { styles } from "./styles/ProfileScreen.style";

// Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

// Redux actions
import { logout, updateUserProfile } from "../../store/authSlice";
import UserService from "../../services/user";

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    profileImage: null,
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    fetchUserDataFromAPI();
  }, []);

  // Também atualizar quando o estado do usuário mudar
  useEffect(() => {
    if (user) {
      updateLocalProfileData();
    }
  }, [user]);

  // Função para buscar dados diretamente da API
  const fetchUserDataFromAPI = async () => {
    try {
      setIsRefreshing(true);
      const response = await UserService.getUserProfile();

      if (response) {
        // Atualizar o estado com dados da API
        setProfileData({
          username: user.username || "",
          email: response.email || "",
          profileImage: response.profileImage || null,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      // Se houver erro, usar dados do Redux como fallback
      updateLocalProfileData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para atualizar dados locais do Redux
  const updateLocalProfileData = () => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        profileImage: user.profileImage || null,
      });
    } else {
      // Definir valores padrão caso o usuário não esteja disponível
      setProfileData({
        username: "",
        email: "",
        profileImage: null,
      });
    }
  };

  // Função para atualizar dados do perfil
  const handleUpdateProfile = async () => {
    // Validação básica
    if (!profileData.username.trim()) {
      Alert.alert("Erro", "O nome é obrigatório");
      return;
    }

    try {
      setUploadProgress(0);
      const intervalId = setInterval(() => {
        setUploadProgress((prev) => {
          // Simular progresso até 90%
          if (prev < 90) {
            return prev + 10;
          }
          return prev;
        });
      }, 300);

      console.log("Var iniciar a atualização");
      dispatch(updateUserProfile(profileData));

      clearInterval(intervalId);
      setUploadProgress(100);

      // Buscar dados atualizados da API após a atualização
      await fetchUserDataFromAPI();

      setTimeout(() => {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso");
        setIsEditing(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      clearInterval(intervalId);
      setUploadProgress(0);

      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil. Tente novamente."
      );
    }
  };

  // Função para remover a imagem de perfil
  const handleRemoveImage = () => {
    Alert.alert(
      "Remover imagem",
      "Tem certeza que deseja remover sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              setImageLoading(true);
              const response = await UserService.removeAvatar();

              // Atualizar o estado local
              setProfileData({
                ...profileData,
                profileImage: null,
              });

              // Atualizar o Redux store se necessário
              if (response && response.data) {
                dispatch(updateUserProfile(response.data));
              }

              // Buscar dados atualizados da API
              await fetchUserDataFromAPI();

              // Mostrar mensagem de sucesso
              Alert.alert("Sucesso", "Foto de perfil removida com sucesso");
            } catch (error) {
              console.error("Erro ao remover imagem:", error);
              Alert.alert(
                "Erro",
                "Não foi possível remover a imagem. Tente novamente."
              );
            } finally {
              setImageLoading(false);
            }
          },
        },
      ]
    );
  };

  // Função para tirar foto
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "É necessário permitir o acesso à câmera."
        );
        return;
      }

      setImageLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const photo = result.assets[0];

        // Verificar tamanho
        const fileInfo = await FileSystem.getInfoAsync(photo.uri);
        if (fileInfo.size > 2 * 1024 * 1024) {
          Alert.alert(
            "Imagem muito grande",
            "A foto é muito grande. O tamanho máximo é 2MB."
          );
          return;
        }

        setProfileData({
          ...profileData,
          profileImage: {
            uri: photo.uri,
            type: "image/jpeg",
            name: "profile-photo.jpg",
          },
        });
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto. Tente novamente.");
    } finally {
      setImageLoading(false);
    }
  };

  // Função para selecionar imagem de perfil
  const handleSelectImage = async () => {
    try {
      setImageLoading(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "É necessário permitir o acesso à galeria de imagens."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];

        // Limite de 2MB
        const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
        if (fileInfo.size > 2 * 1024 * 1024) {
          Alert.alert(
            "Imagem muito grande",
            "Selecione uma imagem de até 2MB."
          );
          return;
        }

        setProfileData({
          ...profileData,
          profileImage: {
            uri: selectedImage.uri,
            type: "image/jpeg",
            name: "profile-image.jpg",
          },
        });
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert(
        "Erro",
        "Não foi possível selecionar a imagem. Tente novamente."
      );
    } finally {
      setImageLoading(false);
    }
  };

  // Função para mostrar opções de imagem
  const handleImageOptions = () => {
    Alert.alert("Foto de perfil", "Como deseja adicionar sua foto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Tirar foto", onPress: handleTakePhoto },
      { text: "Escolher da galeria", onPress: handleSelectImage },
    ]);
  };

  // Função para fazer logout
  const handleLogout = async () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(logout()).unwrap();
          } catch (error) {
            console.error("Erro ao fazer logout:", error);
          }
        },
      },
    ]);
  };

  const ProfileImage = () => (
    <View style={styles.imageContainer}>
      {imageLoading ? (
        <ActivityIndicator size="large" color="#2196f3" />
      ) : profileData.profileImage ? (
        <TouchableOpacity
          activeOpacity={isEditing ? 0.7 : 1}
          onPress={isEditing ? handleImageOptions : undefined}
        >
          <Image
            source={{
              uri:
                typeof profileData.profileImage === "string"
                  ? profileData.profileImage
                  : profileData.profileImage.uri,
            }}
            style={styles.profileImage}
          />

          {isEditing && (
            <View style={styles.imageEditOverlay}>
              <Feather name="camera" size={24} color="#fff" />
              <Text style={styles.imageEditText}>Alterar foto</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.placeholderImage}
          activeOpacity={isEditing ? 0.7 : 1}
          onPress={isEditing ? handleImageOptions : undefined}
        >
          <Feather name="user" size={50} color="#999" />
          {isEditing && (
            <View style={styles.imageEditOverlayPlaceholder}>
              <Feather name="plus" size={24} color="#777" />
              <Text style={styles.imageEditTextPlaceholder}>
                Adicionar foto
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {isEditing && profileData.profileImage && (
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={handleRemoveImage}
        >
          <Feather name="trash-2" size={16} color="#fff" />
        </TouchableOpacity>
      )}

      {uploadProgress > 0 && (
        <View
          style={[
            styles.progressBarContainer,
            { opacity: uploadProgress === 100 ? 0 : 1 },
          ]}
        >
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Feather name="edit-2" size={20} color="#2196f3" />
            </TouchableOpacity>
          )}
        </View>

        {/* Imagem de perfil */}
        <ProfileImage />

        {/* Nome de usuário */}
        <Text style={styles.nameText}>{profileData.username || "Usuário"}</Text>

        {/* Formulário de perfil */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <Input
              value={profileData.username}
              onChangeText={(text) =>
                setProfileData({ ...profileData, username: text })
              }
              placeholder="Seu nome completo"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Input
              value={profileData.email}
              onChangeText={(text) =>
                setProfileData({ ...profileData, email: text })
              }
              placeholder="seu.email@exemplo.com"
              keyboardType="email-address"
              editable={false} // Email não pode ser editado
            />
          </View>

          {/* Preferências */}
        </View>

        {/* Botões de ação */}
        <View style={styles.actionsContainer}>
          {isEditing ? (
            <>
              <Button
                title="Salvar alterações"
                onPress={handleUpdateProfile}
                loading={loading}
                style={styles.saveButton}
              />
              <Button
                title="Cancelar"
                onPress={() => {
                  // Restaurar dados originais
                  loadUserData();
                  setIsEditing(false);
                }}
                style={styles.cancelButton}
                textColor="#666"
                outlined
              />
            </>
          ) : (
            <Button
              title="Sair da conta"
              onPress={handleLogout}
              style={styles.logoutButton}
              textColor="#f44336"
              outlined
              icon={<Feather name="log-out" size={16} color="#f44336" />}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
