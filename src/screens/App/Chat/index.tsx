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
import * as FileSystem from 'expo-file-system/legacy';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

// 🔑 Instância do Gemini direto aqui no Chat.tsx
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 🔊 Transcrição REAL usando Gemini (áudio -> texto)
const transcreverAudio = async (uri: string): Promise<string> => {
  try {
    console.log('📁 URI do áudio para transcrição:', uri);

    // Lê o arquivo de áudio como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      Transcreva exatamente o conteúdo deste áudio em português do Brasil.
      Retorne APENAS o texto falado, sem explicações extras.
    `;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'audio/mp4', // m4a geralmente é tratado como audio/mp4
          data: base64,
        },
      },
    ]);

    const texto = result.response.text().trim();
    console.log('📝 Texto transcrito (Gemini):', texto);
    return texto;
  } catch (error) {
    console.error('❌ Erro na transcrição de áudio (Gemini):', error);
    return '';
  }
};

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
      if (isRecording) {
        console.log('⚠ Já está gravando.');
        return;
      }

      console.log('🔊 Pedindo permissão de microfone...');
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos de permissão para gravar áudio.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('⏺ Iniciando gravação...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      recordingRef.current = recording;
      setIsRecording(true);
      console.log('✅ Gravação iniciada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
      console.error('❌ Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = async () => {
    const activeRecording = recordingRef.current;

    if (!activeRecording) {
      console.log('⚠ Nenhuma gravação ativa para parar.');
      return;
    }

    try {
      console.log('⏹ Parando gravação...');
      setIsRecording(false);

      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      console.log('📁 Áudio salvo em:', uri);

      if (uri) {
        // 1) Transcrever o áudio com Gemini
        let textoTranscrito = '';
        try {
          textoTranscrito = await transcreverAudio(uri);
        } catch (err) {
          console.error('❌ Erro na transcrição:', err);
          textoTranscrito = '';
        }

        console.log('📝 Texto transcrito:', textoTranscrito);

        // 2) Criar mensagem do usuário (texto vindo do áudio)
        const userText =
          textoTranscrito || '🎤 Mensagem de áudio (não foi possível transcrever)';

        const audioMessage: Message = {
          id: Date.now().toString(),
          text: userText,
          isUser: true,
          timestamp: new Date(),
          isAudio: true,
          audioUri: uri,
        };

        setMessages(prev => [...prev, audioMessage]);

        // 3) Enviar texto transcrito para a IA
        try {
          const perguntaParaIA = textoTranscrito || 'áudio do usuário';
          const respostaIA = await gerarRespostaInteligente(perguntaParaIA);

          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: respostaIA,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, botResponse]);
        } catch (error) {
          console.error('Erro IA:', error);
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Desculpe, ocorreu um erro ao processar sua mensagem de áudio. Tente novamente.',
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorResponse]);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível parar a gravação.');
      console.error('❌ Erro ao parar gravação:', error);
    } finally {
      setRecording(null);
      recordingRef.current = null;
    }
  };

  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
      console.error('❌ Erro ao reproduzir áudio:', error);
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    try {
      const respostaIA = await gerarRespostaInteligente(text);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: respostaIA,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Erro IA (texto):', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      {item.isAudio ? (
        // 🔊 Mensagem de áudio clicável + ícone
        <TouchableOpacity
          onPress={() => item.audioUri && playAudio(item.audioUri)}
        >
          <Text
            style={[
              styles.messageText,
              item.isUser ? styles.userMessageText : styles.botMessageText,
            ]}
          >
            ▶️ {item.text}
          </Text>
        </TouchableOpacity>
      ) : (
        // 🧠 Mensagem de texto usando o componente do seu amigo
        <MessageText
          message={item.text}
          isUser={item.isUser}
          userTextStyle={[styles.messageText, styles.userMessageText]}
        />
      )}

      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
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
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() =>
            loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Assistente está digitando...
                </Text>
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
              isRecording && styles.audioButtonRecording,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
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
