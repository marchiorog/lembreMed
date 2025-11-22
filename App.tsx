import React, { useEffect } from 'react';
import Navigation from './src/components/Navigation';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
//import Toast from 'react-native-toast-message';
//import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from './src/context/UserContext';
import { FIREBASE_API_KEY } from "@env";

//SplashScreen.preventAutoHideAsync();

const App = () => {
  useEffect(() => {
    const configurarNotificacoes = async () => {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Você precisa permitir notificações para que os alarmes funcionem corretamente.'
        );
        return;
      }

      await Notifications.setNotificationChannelAsync('medicamentos', {
        name: 'LembreMed',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    };

    configurarNotificacoes();
  }, []);

  return (
    <UserProvider> 
      <Navigation />   
    </UserProvider>
  );
};

export default App;