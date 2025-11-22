import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useGeminiChat } from '@services/chatGemini';
import { MessageText } from '@components/MessageText';
import styles from './styles';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAudio?: boolean;
  audioUri?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente médico virtual. Como posso ajudá-lo hoje?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { gerarRespostaInteligente, loading } = useGeminiChat();

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para gravar áudio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      recordingRef.current = recording;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
      console.error(error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Criar mensagem de áudio
        const audioMessage: Message = {
          id: Date.now().toString(),
          text: "🎤 Mensagem de áudio",
          isUser: true,
          timestamp: new Date(),
          isAudio: true,
          audioUri: uri,
        };
        
        setMessages(prev => [...prev, audioMessage]);
        
        // Enviar áudio diretamente para o assistente
        try {
          const respostaIA = await gerarRespostaInteligente("áudio");
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: respostaIA,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botResponse]);
        } catch (error) {
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Desculpe, ocorreu um erro ao processar sua mensagem de áudio. Tente novamente.',
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorResponse]);
        }
      }
      
      setRecording(null);
      recordingRef.current = null;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível parar a gravação.');
      console.error(error);
    }
  };

  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Gerar resposta inteligente com IA
      try {
        const respostaIA = await gerarRespostaInteligente(inputText.trim());
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: respostaIA,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      } catch (error) {
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <MessageText 
        message={item.text}
        isUser={item.isUser}
        // Passamos os estilos originais do texto do usuário para manter a consistência
        userTextStyle={[styles.messageText, styles.userMessageText]} 
      />
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>Chat de Suporte</Text>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => 
            loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Assistente está digitando...</Text>
              </View>
            ) : null
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[
              styles.audioButton,
              isRecording && styles.audioButtonRecording
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={20} 
              color={isRecording ? '#fff' : '#70C4E8'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#fff' : '#ccc'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Chat;
