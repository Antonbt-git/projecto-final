import api from "./api";
import type { NLPAnalysis, FrequentWord, SentimentAnalysis } from "../types";

export async function analizarTexto(
  texto: string
): Promise<NLPAnalysis> {
  const response = await api.post<NLPAnalysis>("/nltk/analizar", {
    texto,
  });

  return response.data;
}

export async function obtenerPalabrasFrecuentes(
  texto: string
): Promise<FrequentWord[]> {
  const response = await api.post<FrequentWord[]>(
    "/nltk/palabras-frecuentes",
    {
      texto,
    }
  );

  return response.data;
}

export async function analizarSentimiento(
  texto: string
): Promise<SentimentAnalysis> {
  const response = await api.post<SentimentAnalysis>("/nltk/sentimiento", {
    texto,
  });

  return response.data;
}

export async function clasificarTexto(
  texto: string
): Promise<{ categoria: string; confianza?: number }> {
  const response = await api.post(
    "/nltk/clasificar",
    {
      texto,
    }
  );

  return response.data;
}