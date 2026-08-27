// CampusOps AI Agent Pipeline
// Orchestrates the Gemini function-calling loop.
// Gemini autonomously decides which tools to call and in what order.

import { GoogleGenAI, Content } from '@google/genai'
import { toolDefinitions } from './tools'
import { dispatchTool } from './handlers'
import type { Incident } from '../types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface AgentResult {
  incident: Partial<Incident> & { id?: string }
  aiSummary: string
  steps: string[]
  error?: string
}

// ── System prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are CampusOps AI, an intelligent campus operations agent for a university.

Your job is to handle student and staff reports about campus problems: broken lights, dirty washrooms, water issues, hostel problems, classroom/lab faults, electrical hazards, security concerns, and maintenance requests.

When you receive a complaint:
1. Always classify it using classify_complaint.
2. Always extract structured details using extract_details.
3. Use determine_priority if the issue could be safety-critical, hazardous, or urgent. Skip for obviously minor issues.
4. Always assign a department using assign_department.
5. Always create an incident record using create_incident as the final step.

Rules:
- Be thorough but efficient — only call tools that are necessary.
- Your aiSummary in create_incident must be clear, professional, and user-facing (no jargon).
- Your aiReasoning must briefly explain why you chose the priority and department.
- Never expose internal chain-of-thought — only write user-safe content in aiSummary.
- If the complaint is ambiguous, make the most reasonable interpretation.

After creating the incident, provide a short, friendly confirmation to the user explaining what was found and what will happen next.`

// ── Agent Pipeline ────────────────────────────────────────────────────────

export async function runAgentPipeline(
  message: string,
  reporterId: string = 'anonymous'
): Promise<AgentResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  const ai = new GoogleGenAI({ apiKey })
  const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

  const steps: string[] = []
  let createdIncidentId: string | undefined
  let incidentData: Partial<Incident> = {}

  // Build initial conversation
  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ]

  const config = {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: toolDefinitions }],
  }

  // ── Agentic loop ──────────────────────────────────────────────────────────
  // Max iterations guard to prevent infinite loops
  const MAX_ITERATIONS = 10
  let iterations = 0
  let finalText = ''

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await ai.models.generateContent({ model: MODEL, contents, config })

    const functionCalls = response.functionCalls

    // No more function calls — Gemini is done, get final text
    if (!functionCalls || functionCalls.length === 0) {
      finalText = response.text ?? ''
      break
    }

    // Execute all function calls from this turn
    const functionResponseParts: Content['parts'] = []

    for (const call of functionCalls) {
      const toolName = call.name ?? ''
      const toolArgs = (call.args as Record<string, unknown>) ?? {}

      steps.push(toolName)

      const result = await dispatchTool(toolName, toolArgs, reporterId)

      // Capture incident data from handlers
      if (toolName === 'create_incident') {
        if (result.success && result.incidentId) {
          createdIncidentId = result.incidentId as string
        }
        if (toolArgs.title) incidentData.title = String(toolArgs.title)
        if (toolArgs.category) incidentData.category = toolArgs.category as Incident['category']
        if (toolArgs.priority) incidentData.priority = toolArgs.priority as Incident['priority']
        if (toolArgs.priorityScore) incidentData.priorityScore = Number(toolArgs.priorityScore)
        if (toolArgs.location) incidentData.location = String(toolArgs.location)
        if (toolArgs.building) incidentData.building = String(toolArgs.building)
        if (toolArgs.floor) incidentData.floor = String(toolArgs.floor)
        if (toolArgs.department) incidentData.department = String(toolArgs.department)
        if (toolArgs.aiReasoning) incidentData.aiReasoning = String(toolArgs.aiReasoning)
      }
      if (toolName === 'classify_complaint' && result.success) {
        incidentData.category = result.category as Incident['category']
      }
      if (toolName === 'extract_details' && result.success) {
        incidentData.location = result.location as string
        incidentData.building = result.building as string
        incidentData.floor = result.floor as string
      }
      if (toolName === 'determine_priority' && result.success) {
        incidentData.priority = result.priority as Incident['priority']
        incidentData.priorityScore = result.priorityScore as number
      }
      if (toolName === 'assign_department' && result.success) {
        incidentData.department = result.department as string
      }

      functionResponseParts.push({
        functionResponse: {
          name: toolName,
          response: result,
        },
      })
    }

    // Append model's tool-call turn + our tool results to conversation
    const modelContent = response.candidates?.[0]?.content
    if (modelContent) {
      contents.push({ role: 'model', parts: modelContent.parts })
    }
    contents.push({ role: 'user', parts: functionResponseParts })
  }

  const incidentSummary: Partial<Incident> & { id?: string } = {
    id: createdIncidentId,
    ...incidentData,
    status: createdIncidentId ? 'submitted' : undefined,
  }

  return {
    incident: incidentSummary,
    aiSummary: finalText,
    steps,
  }
}
