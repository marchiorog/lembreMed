import { useState } from "react";
import * as FileSystem from 'expo-file-system/legacy';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function useGeminiOCR() {
  const [loading, setLoading] = useState(false);

  async function processarImagem(uri: string) {
    try {
      setLoading(true);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Extraia da imagem da receita médica as informações abaixo e responda APENAS em JSON válido:
        {
          "medicamento": "nome + dosagem",
          "frequencia": "quantidade em horas, apenas número",
          "duracao": "em dias, apenas número"
        }
      `;

      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64 } },
      ]);

      let texto = result.response.text();
      texto = texto.replace(/```json|```/g, "").trim();

      return JSON.parse(texto);
    } catch (error) {
      console.error("Erro no Gemini OCR:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { processarImagem, loading };
}
