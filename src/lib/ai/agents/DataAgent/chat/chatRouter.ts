import { classifyIntent, getIntentSuggestions } from './intentClassifier'
import { buildAndExecuteQuery, type QueryResult } from './queryBuilder'
import { formatResponse, type FormattedResponse } from './responseFormatter'
import { supabaseAdmin } from '@/lib/api/supabase-server'

export interface ChatRequest {
  query: string
  userId: string
  sessionId?: string
}

export interface ChatResponse {
  answer: string
  rawData: Record<string, unknown>[]
  rowCount: number
  intent: {
    id: string
    name: string
    category: string
    confidence: number
  } | null
  suggestions?: Array<{
    id: string
    name: string
    confidence: number
  }>
  executionTimeMs: number
  error?: string
}

function generateSuggestions(query: string): Array<{ id: string; name: string; confidence: number }> | undefined {
  const suggestions = getIntentSuggestions(query)
  if (suggestions.length <= 1) return undefined
  return suggestions.slice(1).map((s) => ({
    id: s.pattern.id,
    name: s.pattern.intentName,
    confidence: s.confidence,
  }))
}

export async function processChatQuery(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now()

  const intent = classifyIntent(request.query)

  if (!intent) {
    return {
      answer: 'Maaf, saya tidak mengerti pertanyaan Anda. Coba tanyakan hal berikut:\n\n- Status invoice INV/2026/05/0001\n- Stok barang rendah\n- Total AR customer ABC\n- Report penjualan bulan ini\n- Supplier dengan PO terbesar',
      rawData: [],
      rowCount: 0,
      intent: null,
      executionTimeMs: Date.now() - startTime,
    }
  }

  if (intent.confidence < 30) {
    const suggestions = getIntentSuggestions(request.query)
    const suggestionList = suggestions
      .slice(0, 3)
      .map((s) => `- ${s.pattern.exampleQuery}`)
      .join('\n')

    return {
      answer: `Saya kurang yakin dengan pertanyaan Anda. Mungkin Anda ingin:\n\n${suggestionList}\n\nSilakan coba dengan kata-kata yang lebih spesifik.`,
      rawData: [],
      rowCount: 0,
      intent: {
        id: intent.pattern.id,
        name: intent.pattern.intentName,
        category: intent.pattern.category,
        confidence: intent.confidence,
      },
      suggestions: generateSuggestions(request.query),
      executionTimeMs: Date.now() - startTime,
    }
  }

  const queryResult: QueryResult = await buildAndExecuteQuery(intent)

  let formattedResponse: FormattedResponse
  if (queryResult.error && queryResult.rowCount === 0) {
    formattedResponse = {
      answer: queryResult.error,
      rawData: [],
      rowCount: 0,
      formattedAt: new Date().toISOString(),
      modelUsed: 'none',
    }
  } else {
    formattedResponse = await formatResponse(intent, queryResult)
  }

  try {
    await supabaseAdmin.from('ai_data_history').insert({
      task_type: 'CHAT',
      user_id: request.userId,
      prompt: request.query,
      response: {
        intent: intent.pattern.id,
        confidence: intent.confidence,
        answer: formattedResponse.answer,
        rowCount: queryResult.rowCount,
      },
      latency_ms: Date.now() - startTime,
    })
  } catch (err) {
    console.error('Failed to save chat history:', err)
  }

  return {
    answer: formattedResponse.answer,
    rawData: formattedResponse.rawData,
    rowCount: formattedResponse.rowCount,
    intent: {
      id: intent.pattern.id,
      name: intent.pattern.intentName,
      category: intent.pattern.category,
      confidence: intent.confidence,
    },
    suggestions: generateSuggestions(request.query),
    executionTimeMs: Date.now() - startTime,
  }
}

export async function processChatQueryStreaming(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onDone: (response: ChatResponse) => void,
  onError: (error: string) => void
): Promise<void> {
  const startTime = Date.now()

  try {
    const intent = classifyIntent(request.query)

    if (!intent) {
      onDone({
        answer: 'Maaf, saya tidak mengerti pertanyaan Anda.',
        rawData: [],
        rowCount: 0,
        intent: null,
        executionTimeMs: Date.now() - startTime,
      })
      return
    }

    onChunk(JSON.stringify({ type: 'intent', data: { id: intent.pattern.id, name: intent.pattern.intentName, confidence: intent.confidence } }))

    const queryResult = await buildAndExecuteQuery(intent)

    onChunk(JSON.stringify({ type: 'query_result', data: { rowCount: queryResult.rowCount, executionTimeMs: queryResult.executionTimeMs } }))

    if (queryResult.error && queryResult.rowCount === 0) {
      onDone({
        answer: queryResult.error,
        rawData: [],
        rowCount: 0,
        intent: {
          id: intent.pattern.id,
          name: intent.pattern.intentName,
          category: intent.pattern.category,
          confidence: intent.confidence,
        },
        executionTimeMs: Date.now() - startTime,
      })
      return
    }

    const { answer, rawData, rowCount } = await formatResponse(intent, queryResult)

    try {
      await supabaseAdmin.from('ai_data_history').insert({
        task_type: 'CHAT',
        user_id: request.userId,
        prompt: request.query,
        response: { intent: intent.pattern.id, confidence: intent.confidence, answer, rowCount },
        latency_ms: Date.now() - startTime,
      })
    } catch {}

    onDone({
      answer,
      rawData,
      rowCount,
      intent: {
        id: intent.pattern.id,
        name: intent.pattern.intentName,
        category: intent.pattern.category,
        confidence: intent.confidence,
      },
      executionTimeMs: Date.now() - startTime,
    })
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Unknown error')
  }
}
