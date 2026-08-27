// Gemini function declarations — defines the tools the agent can call.
// Gemini reads these schemas and decides which tools to invoke.

import { FunctionDeclaration, Type } from '@google/genai'

export const toolDefinitions: FunctionDeclaration[] = [
  {
    name: 'classify_complaint',
    description:
      'Classifies a campus complaint into a category based on the reported issue. ' +
      'Call this first to understand what type of problem is being reported.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          enum: ['electrical', 'plumbing', 'cleanliness', 'security', 'internet', 'classroom', 'hostel', 'other'],
          description: 'The most fitting category for the complaint.',
        },
        confidence: {
          type: Type.NUMBER,
          description: 'Confidence score between 0 and 1.',
        },
        reasoning: {
          type: Type.STRING,
          description: 'Brief reasoning for the classification (1–2 sentences, user-safe).',
        },
      },
      required: ['category', 'confidence', 'reasoning'],
    },
  },

  {
    name: 'extract_details',
    description:
      'Extracts structured location and context details from the raw complaint text. ' +
      'Call this after classifying to capture where and what specifically.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        building: {
          type: Type.STRING,
          description: 'Building or block name (e.g. "Block B", "Main Hall"). Empty string if not mentioned.',
        },
        floor: {
          type: Type.STRING,
          description: 'Floor or level (e.g. "2nd floor", "Ground floor"). Empty string if not mentioned.',
        },
        location: {
          type: Type.STRING,
          description: 'Specific room, area, or spot (e.g. "boys washroom", "Lab 3", "corridor"). Required.',
        },
        details: {
          type: Type.STRING,
          description: 'Any additional context that helps understand severity or specifics.',
        },
      },
      required: ['location'],
    },
  },

  {
    name: 'determine_priority',
    description:
      'Determines the urgency and priority of the incident. ' +
      'Call this for safety-critical issues, electrical faults, water damage, or security threats. ' +
      'Skip for minor cosmetic/cleanliness issues where priority is obviously low.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        priority: {
          type: Type.STRING,
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Urgency level of the incident.',
        },
        priorityScore: {
          type: Type.NUMBER,
          description: 'Numeric score 1–100 indicating urgency (100 = most critical).',
        },
        reasoning: {
          type: Type.STRING,
          description: 'Short reasoning for the priority (user-safe, 1–2 sentences).',
        },
      },
      required: ['priority', 'priorityScore', 'reasoning'],
    },
  },

  {
    name: 'assign_department',
    description:
      'Determines which campus department should handle this incident and whether escalation is needed.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        department: {
          type: Type.STRING,
          description: 'Name of the responsible department (e.g. "Electrical Maintenance", "Housekeeping", "IT Support", "Security Office", "Hostel Administration", "Facilities Management").',
        },
        escalationRequired: {
          type: Type.BOOLEAN,
          description: 'True if the issue needs immediate escalation to senior staff.',
        },
      },
      required: ['department', 'escalationRequired'],
    },
  },

  {
    name: 'create_incident',
    description:
      'Creates the structured incident record in the system. ' +
      'Call this last, after classification, detail extraction, and department assignment are complete.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'A concise incident title (max 80 chars).',
        },
        category: {
          type: Type.STRING,
          enum: ['electrical', 'plumbing', 'cleanliness', 'security', 'internet', 'classroom', 'hostel', 'other'],
        },
        priority: {
          type: Type.STRING,
          enum: ['low', 'medium', 'high', 'critical'],
        },
        priorityScore: { type: Type.NUMBER },
        location: { type: Type.STRING },
        building: { type: Type.STRING },
        floor: { type: Type.STRING },
        department: { type: Type.STRING },
        aiSummary: {
          type: Type.STRING,
          description: 'Clear, user-facing summary of the incident and action taken.',
        },
        aiReasoning: {
          type: Type.STRING,
          description: 'Brief explanation of priority/routing decisions.',
        },
      },
      required: ['title', 'category', 'priority', 'priorityScore', 'location', 'department', 'aiSummary', 'aiReasoning'],
    },
  },

  {
    name: 'get_incident_status',
    description: 'Retrieves the current status and details of an existing incident by ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        incidentId: {
          type: Type.STRING,
          description: 'The Firestore document ID of the incident.',
        },
      },
      required: ['incidentId'],
    },
  },
]
