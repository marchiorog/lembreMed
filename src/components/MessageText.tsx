import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MessageTextProps {
  message: string;
  isUser: boolean;
  userTextStyle?: StyleProp<TextStyle>; 
}

export const MessageText = ({ message, isUser, userTextStyle }: MessageTextProps) => {
  if (isUser) {
    // Usuário: Renderiza texto puro com os estilos passados (array ou objeto)
    return <Text style={userTextStyle}>{message}</Text>;
  }

  // Bot/Gemini: Renderiza Markdown
  return (
    <Markdown style={markdownStyles}>
      {message}
    </Markdown>
  );
};

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  list_item: {
    marginVertical: 4,
  },
  bullet_list: {
    marginVertical: 4,
  },
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  paragraph: {
    marginBottom: 8,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
});