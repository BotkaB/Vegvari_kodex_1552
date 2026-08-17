// server/services/aiService.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import {
  MENTOR_CHAT_PROMPT,
  RESOURCE_ENGINE_PROMPT,
} from "../config/prompts.js";

// AI modellek sorrendje hiba/kvótalimit esetére (Fallback chain)
const MODEL_CHAIN = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-3-flash",
];

// Mentor Chat elvárt JSON válaszstruktúrája (JSON Schema)
const MENTOR_CHAT_SCHEMA = {
  type: "object",
  properties: {
    mode: { type: "string" },
    attack_detected: { type: "boolean" },
    attack_type: { type: "string" },
    mate_ba: { type: "string" },
    ambrus_ba: { type: "string" },
    kristof_aprod: { type: "string" },
    janos_deak: { type: "string" },
    citation: { type: "string" },
  },
  required: [
    "mode",
    "attack_detected",
    "attack_type",
    "mate_ba",
    "ambrus_ba",
    "kristof_aprod",
    "janos_deak",
    "citation",
  ],
};

// Tároló a feltöltött fájlok hivatkozásai számára
let uploadedFiles = [];
let aiClient = null;

// Dinamikus/Lazy inicializáló függvény: csak akkor fut le, amikor tényleg szükség van az AI-ra
export function getAi() {
  if (!aiClient) {
    dotenv.config(); // Biztosítjuk, hogy a .env be legyen olvasva
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

const sanitizeFileName = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");
};

// ========== DOKUMENTUMOK INICIALIZÁLÁSA ==========
export async function initializeDocuments(dataDir) {
  const ai = getAi();

  if (!ai) {
    console.warn(
      "⚠️ Nem található Gemini API kulcs, a dokumentumok feltöltése kihagyva.",
    );
    return;
  }

  try {
    if (!fs.existsSync(dataDir)) {
      console.warn(`⚠️ A data mappa nem található itt: ${dataDir}`);
      return;
    }

    const files = fs.readdirSync(dataDir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".pdf", ".txt", ".docx", ".csv", ".md"].includes(ext);
    });

    if (files.length === 0) {
      console.log("ℹ️ Nincsenek feltöltendő fájlok a data/ mappában.");
      return;
    }

    console.log("🔍 Fájlok állapotának ellenőrzése a Google File API-ban...");

    // Lekérjük a Google File API-n már meglévő fájlok listáját
    const remoteFileMap = new Map();
    try {
      const listResponse = await ai.files.list();

      // Az új @google/genai SDK AsyncIterable (for await) struktúrájának kezelése
      if (
        listResponse &&
        typeof listResponse[Symbol.asyncIterator] === "function"
      ) {
        for await (const remoteFile of listResponse) {
          const key = remoteFile.displayName || remoteFile.name;
          if (key) remoteFileMap.set(key, remoteFile);
        }
      } else {
        const filesArray = Array.isArray(listResponse)
          ? listResponse
          : listResponse?.files || [];

        for (const remoteFile of filesArray) {
          const key = remoteFile.displayName || remoteFile.name;
          if (key) remoteFileMap.set(key, remoteFile);
        }
      }
    } catch (listError) {
      console.warn(
        "⚠️ Nem sikerült lekérni a távoli fájllistát, szükség esetén újra feltöltjük:",
        listError.message,
      );
    }

    // Lista ürítése
    uploadedFiles = [];

    for (const file of files) {
      const filePath = path.join(dataDir, file);

      let mimeType = "application/pdf";
      if (file.endsWith(".txt")) mimeType = "text/plain";
      else if (file.endsWith(".md")) mimeType = "text/markdown";
      else if (file.endsWith(".csv")) mimeType = "text/csv";

      const cleanDisplayName = sanitizeFileName(file);
      const existingRemote = remoteFileMap.get(cleanDisplayName);

      // Ha már fel van töltve a Google-re, nem töltjük fel újra!
      if (existingRemote) {
        uploadedFiles.push({
          displayName: cleanDisplayName,
          fileName: file,
          fileData: {
            fileUri: existingRemote.uri,
            mimeType: existingRemote.mimeType || mimeType,
          },
        });
        console.log(
          `  ✅ Megtalálva (már fel van töltve): ${cleanDisplayName}`,
        );
      } else {
        console.log(`  📤 Új fájl feltöltése: ${cleanDisplayName}...`);
        const uploadResult = await ai.files.upload({
          file: filePath,
          config: {
            displayName: cleanDisplayName,
            mimeType: mimeType,
          },
        });

        uploadedFiles.push({
          displayName: cleanDisplayName,
          fileName: file,
          fileData: {
            fileUri: uploadResult.uri,
            mimeType: uploadResult.mimeType || mimeType,
          },
        });

        console.log(`  ✅ Sikeresen feltöltve: ${cleanDisplayName}`);
      }
    }

    console.log(
      "✨ Valamennyi dokumentum sikeresen csatolva a Gemini motorhoz!",
    );
  } catch (error) {
    console.error(
      "❌ Hiba a dokumentumok induláskori feldolgozása közben:",
      error,
    );
  }
}

export function getUploadedFiles() {
  return uploadedFiles;
}

// ========== AI GENERÁLÁS TARTALÉK LÁNCCAL (FALLBACK) ==========
async function generateContentWithFallback(
  contents,
  systemInstruction,
  temperature = 0.5,
  responseSchema = null,
) {
  const ai = getAi();
  if (!ai) throw new Error("A Gemini API kulcs nincs beállítva.");

  let lastError = null;

  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i];
    try {
      const configObj = {
        temperature: temperature,
        maxOutputTokens: 4000,
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      };

      if (responseSchema) {
        configObj.responseSchema = responseSchema;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: configObj,
      });

      let warning = null;
      if (i > 0) {
        warning = `Az elsődleges AI modell túlterhelt volt, az alábbira váltottunk: ${modelName}`;
        console.log(
          `ℹ️ [MODEL FALLBACK] Sikeres hívás ezzel a modellel: ${modelName}`,
        );
      }

      return {
        text: response.text,
        ...(warning ? { _warning: warning } : {}),
      };
    } catch (err) {
      console.warn(
        `⚠️ Hiba a(z) '${modelName}' modell használatakor:`,
        err.message || err,
      );
      lastError = err;
    }
  }

  // Ha az összes modell kimerült, a frontend (App.jsx) által elvárt formátumú hibát dobunk
  const quotaError = new Error("elfogyott a keret");
  quotaError.status = 429;
  quotaError.details = "Minden elérhető AI modell napi kvótája kimerült.";
  quotaError.originalError = lastError;
  throw quotaError;
}

// ========== MENTOR CHAT HÍVÁS ==========
export async function callMentorChat(userMessage, activeMentors) {
  const fileParts = uploadedFiles.map((f) => ({ fileData: f.fileData }));

  // Egyetlen "user" Content objektumba helyezzük a fájlokat ÉS a promptot
  const contents = [
    {
      role: "user",
      parts: [
        ...fileParts,
        {
          text: `Aktivált mentorok: ${JSON.stringify(activeMentors)}\nFelhasználó kérdése: ${userMessage}`,
        },
      ],
    },
  ];

  return await generateContentWithFallback(
    contents,
    MENTOR_CHAT_PROMPT,
    0.6,
    MENTOR_CHAT_SCHEMA,
  );
}

// ========== RESOURCE ENGINE HÍVÁS ==========
export async function callResourceEngine(
  mode,
  selectedChapter,
  selectedFileUri = null,
) {
  let targetFiles = uploadedFiles;

  if (selectedFileUri) {
    const foundFile = uploadedFiles.find(
      (f) => f.fileData.fileUri === selectedFileUri,
    );
    if (foundFile) {
      targetFiles = [foundFile];
    }
  }

  const fileParts = targetFiles.map((f) => ({ fileData: f.fileData }));
  const promptText = `Kért mód: ${mode}. Kiválasztott fejezet/kontextus: ${selectedChapter || "Összes dokumentum"}`;

  // Egyetlen "user" Content objektumba helyezzük a fájlokat ÉS a promptot
  const contents = [
    {
      role: "user",
      parts: [...fileParts, { text: promptText }],
    },
  ];

  return await generateContentWithFallback(
    contents,
    RESOURCE_ENGINE_PROMPT,
    0.4,
  );
}