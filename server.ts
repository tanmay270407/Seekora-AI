import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      description: 'The core intent, e.g. "Find job listings", "Extract company profiles", "Discover startups"',
    },
    query: {
      type: Type.STRING,
      description: 'Normalized search query',
    },
    entity: {
      type: Type.STRING,
      description: 'Target entity type, e.g. "Java developer jobs", "SaaS companies", "AI startups"',
    },
    location: {
      type: Type.STRING,
      description: 'Target geographical region, city, or "Remote", or "Global". Empty string if unspecified',
    },
    target_count: {
      type: Type.INTEGER,
      description: 'Desired number of records to collect, e.g. 100 or 50',
    },
    fields: {
      type: Type.ARRAY,
      description: 'List of specific data fields requested or necessary for this entity',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Field name, e.g. Company, Role, Salary, Location, Website' },
          description: { type: Type.STRING, description: 'Brief description of the field' },
          required: { type: Type.BOOLEAN, description: 'Whether this field is essential' },
        },
        required: ['name', 'description', 'required'],
      },
    },
    filters: {
      type: Type.ARRAY,
      description: 'Specific criteria or filter conditions',
      items: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING },
          operator: { type: Type.STRING },
          value: { type: Type.STRING },
        },
        required: ['field', 'operator', 'value'],
      },
    },
    source_types: {
      type: Type.ARRAY,
      description: 'Recommended generic source channels, e.g. "Job boards", "Company career pages", "Public APIs", "Web directories"',
      items: { type: Type.STRING },
    },
    constraints: {
      type: Type.ARRAY,
      description: 'Constraints or quality standards',
      items: { type: Type.STRING },
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence score between 0.0 and 1.0 (e.g. 0.94)',
    },
    needs_clarification: {
      type: Type.BOOLEAN,
      description: 'True if the request is ambiguous, lacks vital target entity or location, or is incomplete',
    },
    clarification_question: {
      type: Type.STRING,
      description: 'Concise question to ask the user if clarification is needed. Empty string otherwise',
    },
    clarification_field: {
      type: Type.STRING,
      description: 'The parameter needing clarification: "location", "target_count", "role", etc. Empty string otherwise',
    },
    suggested_workflow: {
      type: Type.ARRAY,
      description: 'Ordered pipeline workflow steps (6-8 concise steps)',
      items: { type: Type.STRING },
    },
  },
  required: [
    'intent',
    'query',
    'entity',
    'target_count',
    'fields',
    'filters',
    'source_types',
    'constraints',
    'confidence',
    'needs_clarification',
    'suggested_workflow',
  ],
};

const SYSTEM_INSTRUCTION = `You are Seekora AI's Requirement Intelligence Layer.
Your task is to understand user natural language requests for data extraction and convert them into a precise, structured collection specification.

CRITICAL RULES:
1. NEVER fabricate fake job listings, fake companies, fake records, or fake URLs. You are ONLY creating the collection specification and workflow plan.
2. If the request is overly vague or ambiguous (e.g., "Find developer jobs" without location or programming language, or "Get companies" without industry/region), set "needs_clarification": true, specify the "clarification_field", and generate a short, friendly "clarification_question" (e.g. "Which location would you like to search in?", "How many results do you need?").
3. When the request is clear, set "needs_clarification": false. Extract the intent, entity, location, target count (default to 100 if unspecified), required data fields, source types (general categories like "Job boards", "Company career pages", "Public APIs"), constraints, and confidence level (e.g. 0.88-0.96).
4. Provide a standard 6-8 step collection workflow, such as:
   1. Identify relevant sources
   2. Collect candidate records
   3. Extract requested fields
   4. Normalize records
   5. Remove duplicates
   6. Validate records
   7. Attach source metadata
   8. Prepare dataset`;

// API endpoint for natural language request analysis
app.post('/api/analyze-request', async (req, res) => {
  try {
    const { prompt, clarificationValue, clarificationField } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A valid request prompt is required.' });
    }

    let userContent = prompt.trim();
    if (clarificationValue && clarificationField) {
      userContent += `\n[Additional Context from User: ${clarificationField} is "${clarificationValue}"]`;
    }

    // Try gemini-2.5-flash first, fallback to gemini-3.1-flash-lite or gemini-3.8-flash
    let responseText = '';
    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userContent,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: analysisResponseSchema,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} attempt error:`, err?.status || err?.message);
      }
    }

    if (!responseText) {
      return res.status(502).json({ error: 'Unable to analyze the request right now. Please try again.' });
    }

    const parsed = JSON.parse(responseText);

    // Format fields with clean Title Case
    const cleanFields = Array.isArray(parsed.fields)
      ? parsed.fields.map((f: any) => ({
          name: typeof f.name === 'string' ? f.name.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Field',
          description: f.description || '',
          required: Boolean(f.required),
        }))
      : [];

    const cleanSourceTypes = Array.isArray(parsed.source_types)
      ? parsed.source_types.map((s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))
      : ['Job Boards', 'Public Directories', 'Company Career Pages'];

    const cleanWorkflow = Array.isArray(parsed.suggested_workflow) && parsed.suggested_workflow.length > 0
      ? parsed.suggested_workflow.map((w: string) => w.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))
      : [
          'Identify Relevant Sources',
          'Collect Candidate Records',
          'Extract Requested Fields',
          'Normalize Records',
          'Remove Duplicates',
          'Validate Records',
          'Attach Source Metadata',
          'Prepare Dataset',
        ];

    const sanitized = {
      ...parsed,
      location: parsed.location && parsed.location.trim().length > 0 ? parsed.location.trim() : null,
      clarification_question: parsed.needs_clarification ? parsed.clarification_question || null : null,
      clarification_field: parsed.needs_clarification ? parsed.clarification_field || null : null,
      confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.65), 0.98) : 0.94,
      target_count: typeof parsed.target_count === 'number' && parsed.target_count > 0 ? parsed.target_count : 100,
      fields: cleanFields,
      filters: Array.isArray(parsed.filters) ? parsed.filters : [],
      source_types: cleanSourceTypes,
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : ['Deduplication', 'Schema compliance'],
      suggested_workflow: cleanWorkflow,
    };

    return res.json(sanitized);
  } catch (error: any) {
    console.error('Gemini analysis error:', error?.message || error);
    return res.status(500).json({
      error: 'Unable to analyze the request right now. Please try again.',
    });
  }
});

// Mount Vite in development, serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Seekora AI server running on port ${port}`);
  });
}

startServer();
