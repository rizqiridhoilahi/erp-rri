import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { quotationFiltersSchema, quotationSchema } from '@/lib/validations/quotation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // List quotations dengan filters
      const filters = quotationFiltersSchema.parse(req.query)

      let query = supabase
        .from('quotations')
        .select(
          'id, quotation_no, customer_id, quotation_date, valid_until, status, notes, created_at, updated_at'
        )

      // Apply filters
      if (filters.search) {
        query = query.ilike('quotation_no', `%${filters.search}%`)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      if (filters.dateFrom) {
        query = query.gte('quotation_date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('quotation_date', filters.dateTo)
      }

      // Sorting & pagination
      query = query
        .order(filters.sortBy === 'quotationDate' ? 'quotation_date' : 'created_at', {
          ascending: filters.sortOrder === 'asc',
        })
        .range((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({
        data: data || [],
        pagination: {
          page: filters.page,
          pageSize: filters.pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / filters.pageSize),
        },
      })
    } else if (req.method === 'POST') {
      // Create new quotation
      const body = quotationSchema.parse(req.body)

      // Start transaction
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          customer_id: body.customerId,
          quotation_date: body.quotationDate,
          valid_until: body.validUntil,
          status: body.status || 'draft',
          notes: body.notes,
        })
        .select()
        .single()

      if (quotationError) {
        console.error('Supabase error:', quotationError)
        return res.status(500).json({ error: quotationError.message })
      }

      // Insert line items
      const lineItems = body.lineItems.map((item) => ({
        quotation_id: quotationData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent || 0,
        notes: item.notes,
      }))

      const { error: lineError } = await supabase
        .from('quotation_line_items')
        .insert(lineItems)

      if (lineError) {
        console.error('Supabase error:', lineError)
        // Cleanup: delete the created quotation if line items fail
        await supabase.from('quotations').delete().eq('id', quotationData.id)
        return res.status(500).json({ error: lineError.message })
      }

      // Fetch complete data with line items
      const { data: result, error: fetchError } = await supabase
        .from('quotations')
        .select(
          `
          id,
          quotation_no,
          customer_id,
          quotation_date,
          valid_until,
          status,
          notes,
          created_at,
          updated_at,
          quotation_line_items (*)
        `
        )
        .eq('id', quotationData.id)
        .single()

      if (fetchError) {
        console.error('Supabase error:', fetchError)
        return res.status(500).json({ error: fetchError.message })
      }

      return res.status(201).json(result)
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Handler error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return res.status(400).json({ error: message })
  }
}
