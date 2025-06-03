import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

type PerfilScreenNavigationProp = StackNavigationProp<{
  Configuracao: undefined;
  MeuPerfil: undefined;
  Login: undefined;
}>;

type Props = {
  navigation: PerfilScreenNavigationProp;
};

const { width, height } = Dimensions.get('window');

export default function Perfil({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [nome, setNome] = useState('teste');
  const [email, setEmail] = useState('teste@email.com');
  const userProfileImage = 'sem foto';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setNome(userData.name || '');
          setEmail(userData.email || '');
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.navigate('Login');
    }).catch((error) => {
      console.error('Erro ao fazer logout: ', error);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>

        {user ? (
          <View style={styles.profileContainer}>
            <View style={styles.profileCircle}>
              <Image source={{ uri: userProfileImage }} style={styles.profileImage} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{nome || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{email}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.loadingText}>Carregando informações do usuário...</Text>
        )}

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('MeuPerfil')}>
            <Ionicons name="person-outline" size={24} color="black" />
            <Text style={styles.optionText}>Meu perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Configuracao')}>
            <Ionicons name="settings" size={24} color="black" />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>

          {user && (
            <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
              <Ionicons name="exit-outline" size={24} color="black" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.05,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.04,
    textAlign: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  profileCircle: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.1,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  profileImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.1,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: width * 0.04,
    color: '#777',
  },
  loadingText: {
    fontSize: width * 0.04,
    color: '#777',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: height * 0.03,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },
  optionText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
  logoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    marginBottom: height * 0.12,
  },
  logoutText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
});