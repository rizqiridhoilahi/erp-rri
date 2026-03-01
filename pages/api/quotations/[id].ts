import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { quotationSchema } from '@/lib/validations/quotation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid quotation ID' })
  }

  try {
    if (req.method === 'GET') {
      // Get single quotation with line items
      const { data, error } = await supabase
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
          quotation_line_items (
            id,
            quotation_id,
            product_id,
            quantity,
            unit_price,
            discount_percent,
            line_total,
            notes,
            created_at,
            updated_at
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        return res.status(404).json({ error: 'Quotation not found' })
      }

      return res.status(200).json(data)
    } else if (req.method === 'PUT') {
      // Update quotation
      const body = quotationSchema.parse(req.body)

      // Update header
      const { error: headerError } = await supabase
        .from('quotations')
        .update({
          customer_id: body.customerId,
          quotation_date: body.quotationDate,
          valid_until: body.validUntil,
          status: body.status,
          notes: body.notes,
        })
        .eq('id', id)

      if (headerError) {
        console.error('Supabase error:', headerError)
        return res.status(500).json({ error: headerError.message })
      }

      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('quotation_line_items')
        .delete()
        .eq('quotation_id', id)

      if (deleteError) {
        console.error('Supabase error:', deleteError)
        return res.status(500).json({ error: deleteError.message })
      }

      // Insert new line items
      const lineItems = body.lineItems.map((item) => ({
        quotation_id: id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent || 0,
        notes: item.notes,
      }))

      const { error: insertError } = await supabase
        .from('quotation_line_items')
        .insert(lineItems)

      if (insertError) {
        console.error('Supabase error:', insertError)
        return res.status(500).json({ error: insertError.message })
      }

      // Return updated quotation
      const { data, error: fetchError } = await supabase
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
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Supabase error:', fetchError)
        return res.status(500).json({ error: fetchError.message })
      }

      return res.status(200).json(data)
    } else if (req.method === 'DELETE') {
      // Delete quotation (cascade delete handled by DB)
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(204).end()
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Handler error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return res.status(400).json({ error: message })
  }
}
