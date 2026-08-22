import Ajv from "ajv";


const ajv = new Ajv({ allErrors: true, strict: false });


// ---------------------------------------------------------
// SÉMÁDEFINÍCIÓK (Exportálva a Gemini API híváshoz is)
// ---------------------------------------------------------

// Mentor Chat elvárt JSON válaszstruktúrája
export const MENTOR_CHAT_SCHEMA = {
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
  additionalProperties: false,
};

// Resource Engine elvárt JSON válaszstruktúrája
export const RESOURCE_ENGINE_SCHEMA = {
  type: "object",
  properties: {
    mode: { type: "string" },
    citation: { type: "string" },
    document_content: {
      type: "object",
      properties: {
        title: { type: "string" },
        paragraphs: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["title", "paragraphs"],
      nullable: true,
    },
    quizzes: {
      type: "array",
      nullable: true,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_answer: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["question", "options", "correct_answer", "explanation"],
      },
    },
  },
  required: ["mode", "citation"],
  additionalProperties: false,
};

// ---------------------------------------------------------
// VALIDÁTOROK LEFORDÍTÁSA (Induláskor egyszer)
// ---------------------------------------------------------

const validators = {
  mentorChat: ajv.compile(MENTOR_CHAT_SCHEMA),
  resourceEngine: ajv.compile(RESOURCE_ENGINE_SCHEMA),
};

// ---------------------------------------------------------
// EXPORTÁLT VALIDÁLÓ FÜGGVÉNY
// ---------------------------------------------------------

/**
 * Validálja az AI válaszát a megadott séma alapján.
 * @param {'mentorChat' | 'resourceEngine'} type
 * @param {object} data - A safeJsonParse által feldolgozott objektum.
 * @returns {object} - A validált adat (ha sikeres).
 * @throws {Error} - Ha a validáció sikertelen (ValidationError).
 */
export function validateResponse(type, data) {
  const validate = validators[type];
  if (!validate) {
    throw new Error(`Ismeretlen validátor típus: ${type}`);
  }

  const valid = validate(data);
  if (!valid) {
    const errors = validate.errors
      .map((e) => {
        const path = e.instancePath || "root";
        const msg = e.message || "validation failed";
        return `${path} ${msg}`;
      })
      .join("; ");

    const error = new Error(
      `AI response schema validation failed [${type}]: ${errors}`,
    );
    error.name = "ValidationError";
    error.validationErrors = validate.errors;
    throw error;
  }

  return data;
}
