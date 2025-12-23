import { GoogleGenAI, Type } from "@google/genai";
import { ProjectBlueprint, ProjectTemplate } from "../types/index";

// Initialize the Google GenAI client with named parameters and the key from process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Defining the response schema for JSON output using the recommended Type enum
const projectSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING, description: "Project name" },
    tagline: { type: Type.STRING, description: "Catchy slogan" },
    description: { type: Type.STRING, description: "Short technical summary" },
    estimatedDuration: { type: Type.STRING, description: "e.g., '1 week'" },
    techStack: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "category", "reason"]
      }
    },
    features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
        },
        required: ["name", "description", "complexity"]
      }
    },
    fileStructure: {
      type: Type.ARRAY,
      description: "Root level files and folders with COMPLETE SOURCE CODE",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["file", "folder"] },
          content: { type: Type.STRING, description: "The full source code content for this file. MUST be populated for files." },
          children: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["file", "folder"] },
                content: { type: Type.STRING },
                children: { 
                  type: Type.ARRAY,
                  items: {
                     type: Type.OBJECT,
                     properties: {
                       name: { type: Type.STRING },
                       type: { type: Type.STRING, enum: ["file", "folder"] },
                       content: { type: Type.STRING }
                     }
                  }
                 }
              }
            }
          }
        },
        required: ["name", "type"]
      }
    }
  },
  required: ["projectName", "tagline", "description", "techStack", "features", "fileStructure", "estimatedDuration"]
};

export const generateBlueprint = async (prompt: string, language: 'en' | 'bn' = 'en', template: ProjectTemplate | null = null): Promise<ProjectBlueprint> => {
  try {
    const languageInstruction = language === 'bn' 
      ? "The user interface language MUST be Bangla (Bengali). Generate descriptions, comments, and UI text in Bangla. Technical terms (like React, API) can remain in English." 
      : "The user interface language MUST be English.";

    const templateInstruction = template 
      ? `PROJECT ARCHITECTURE: ${template.id.toUpperCase()}. 
         TECHNICAL REQUIREMENTS: ${template.promptModifier}.
         Ensure the codebase reflects high-quality industry standards for this specific category.` 
      : "PROJECT TYPE: CUSTOM AD-HOC ARCHITECTURE.";

    // Using gemini-3-pro-preview for complex coding tasks as per guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are Pavel AI, a world-class senior full-stack engineer. 
      Generate a COMPLETE, RUNNABLE, PRODUCTION-READY React MVP project for: "${prompt}".
      
      CONTEXT: ${languageInstruction}
      ARCHITECTURAL DIRECTIVE: ${templateInstruction}
      
      CORE REQUIREMENTS:
      1. Return a JSON object matching the schema.
      2. Generate FULL SOURCE CODE for every file. 
      3. BROWSER COMPATIBILITY: Run via Babel Standalone.
         - Standard imports (react, react-dom/client, lucide-react).
         - Use Lucide React for ALL icons.
         - Do NOT use \`process.env\` or external node modules that require bundling.
      4. COMPONENT ARCHITECTURE:
         - MUST include \`index.html\` (with root div and module script tag).
         - MUST include \`index.tsx\` as entry point.
         - Break logic into reusable components within a \`components/\` folder.
      5. AESTHETICS:
         - Use Tailwind CSS for ultra-modern design.
         - Implement responsive layouts, smooth transitions, and dark-mode friendly palettes.
      6. QUALITY:
         - Ensure clean state management (useState/useEffect).
         - Add basic error handling in components.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as ProjectBlueprint;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};