import { type IntentMatch } from './intentClassifier'
import { supabaseAdmin } from '@/lib/api/supabase-server'

export interface QueryResult {
  sql: string
  params: string[]
  paramValues: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  error?: string
  executionTimeMs: number
}

function replaceParams(sql: string, paramValues: string[]): string {
  return sql.replace(/\$(\d+)/g, (_match, num) => {
    const i = parseInt(num, 10) - 1
    if (i >= 0 && i < paramValues.length) {
      return `'${paramValues[i].replace(/'/g, "''")}'`
    }
    return _match
  })
}

function resolveParamOrder(sql: string): number[] {
  const matches = sql.match(/\$(\d+)/g)
  if (!matches) return []
  return [...new Set(matches.map((m) => parseInt(m.replace('$', ''), 10)))].sort((a, b) => a - b)
}

export async function buildAndExecuteQuery(intent: IntentMatch): Promise<QueryResult> {
  const startTime = Date.now()

  const { pattern, extractedParams } = intent

  if (pattern.params.length > 0 && Object.keys(extractedParams).length === 0) {
    return {
      sql: pattern.sql,
      params: pattern.params,
      paramValues: [],
      rows: [],
      rowCount: 0,
      error: `Query membutuhkan parameter: ${pattern.params.join(', ')}. Contoh: "${pattern.exampleQuery}"`,
      executionTimeMs: Date.now() - startTime,
    }
  }

  const paramOrder = resolveParamOrder(pattern.sql)
  const paramValues: string[] = []
  const missingParams: string[] = []

  for (const idx of paramOrder) {
    const paramName = pattern.params[idx - 1]
    const paramValue = extractedParams[paramName]
    if (paramValue) {
      paramValues.push(paramValue)
    } else {
      missingParams.push(paramName)
    }
  }

  if (missingParams.length > 0) {
    return {
      sql: pattern.sql,
      params: pattern.params,
      paramValues: [],
      rows: [],
      rowCount: 0,
      error: `Mohon lengkapi informasi: ${missingParams.join(', ')}. Contoh: "${pattern.exampleQuery}"`,
      executionTimeMs: Date.now() - startTime,
    }
  }

  try {
    const rawSql = replaceParams(pattern.sql, paramValues)

    const { data, error } = await supabaseAdmin
      .rpc('exec_sql', { query_text: rawSql })

    if (error) {
      const { error: directError } = await supabaseAdmin
        .from('_dummy')
        .select('*')
        .limit(0)

      if (directError?.message?.includes('function exec_sql')) {
        const { error: fallbackError } = await supabaseAdmin
          .from('_temp_query')
          .select('*')
          .limit(0)

        if (fallbackError) {
          const { error: rawError } = await supabaseAdmin
            .rpc('exec_raw_sql', { sql: rawSql })

          if (rawError) {
            return {
              sql: pattern.sql,
              params: pattern.params,
              paramValues,
              rows: [],
              rowCount: 0,
              error: `Fungsi exec_sql belum tersedia. Jalankan migration terlebih dahulu. Error: ${rawError.message}`,
              executionTimeMs: Date.now() - startTime,
            }
          }
        }
      }

      return {
        sql: pattern.sql,
        params: pattern.params,
        paramValues,
        rows: [],
        rowCount: 0,
        error: `Database error: ${error.message}`,
        executionTimeMs: Date.now() - startTime,
      }
    }

    const rows = (data as Record<string, unknown>[]) ?? []

    return {
      sql: pattern.sql,
      params: pattern.params,
      paramValues,
      rows,
      rowCount: rows.length,
      executionTimeMs: Date.now() - startTime,
    }
  } catch (err) {
    return {
      sql: pattern.sql,
      params: pattern.params,
      paramValues,
      rows: [],
      rowCount: 0,
      error: err instanceof Error ? err.message : 'Unknown error executing query',
      executionTimeMs: Date.now() - startTime,
    }
  }
}
