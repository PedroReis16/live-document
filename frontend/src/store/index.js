import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importar os slices
import authSlice from "./authSlice";
import documentSlice from "./documentSlice";
import shareSlice from "./shareSlice";

// Configuração de persistência
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "documents"], // Apenas auth e documents serão persistidos
  blacklist: ["share"], // share não será persistido (dados temporários)
};

// Combinar reducers
const appReducer = combineReducers({
  auth: authSlice.reducer,
  documents: documentSlice.reducer,
  share: shareSlice.reducer,
});

// Middleware customizado para limpar store
const rootReducer = (state, action) => {
  if (action.type === "CLEAR_STORE") {
    // Limpar AsyncStorage
    AsyncStorage.clear();
    // Resetar state
    state = undefined;
  }
  return appReducer(state, action);
};

// Aplicar persistência ao rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar actions do redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__, // Habilitar Redux DevTools apenas em desenvolvimento
});

// Configurar persistor
export const persistor = persistStore(store);

// Typed hooks para usar no app
import { useDispatch, useSelector } from "react-redux";
export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);

// Action para limpar todo o store (útil no logout)
export const clearStore = () => {
  return {
    type: "CLEAR_STORE",
  };
};
