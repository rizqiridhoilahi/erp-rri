import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { salesOrderFiltersSchema, salesOrderSchema } from '@/lib/validations/sales-order'

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
      // List sales orders dengan filters
      const filters = salesOrderFiltersSchema.parse(req.query)

      let query = supabase
        .from('sales_orders')
        .select(
          'id, sales_order_no, quotation_id, customer_id, customer_name, po_number, so_date, delivery_date, delivery_address, status, subtotal, tax_amount, total_amount, notes, created_at, updated_at'
        )

      // Apply filters
      if (filters.search) {
        query = query.ilike('sales_order_no', `%${filters.search}%`)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      if (filters.dateFrom) {
        query = query.gte('so_date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('so_date', filters.dateTo)
      }

      // Sorting & pagination
      query = query
        .order(filters.sortBy === 'soDate' ? 'so_date' : 'created_at', {
          ascending: filters.sortOrder === 'asc',
        })
        .range((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({
        data: (data || []).map((so: any) => ({
          id: so.id,
          salesOrderNo: so.sales_order_no,
          quotationId: so.quotation_id,
          customerId: so.customer_id,
          customerName: so.customer_name,
          poNumber: so.po_number,
          soDate: so.so_date,
          deliveryDate: so.delivery_date,
          deliveryAddress: so.delivery_address,
          status: so.status,
          subtotal: so.subtotal,
          taxAmount: so.tax_amount,
          totalAmount: so.total_amount,
          notes: so.notes,
          createdAt: so.created_at,
          updatedAt: so.updated_at,
        })),
        pagination: {
          page: filters.page,
          pageSize: filters.pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / filters.pageSize),
        },
      })
    } else if (req.method === 'POST') {
      // Create new sales order
      const body = salesOrderSchema.parse(req.body)

      // Generate SO number (sequential: SO-YYYY-0001)
      const year = new Date().getFullYear();
      // Get latest SO number for this year
      const { data: latestSO, error: latestError } = await supabase
        .from('sales_orders')
        .select('sales_order_no')
        .ilike('sales_order_no', `SO-${year}-%`)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextSeq = 1;
      if (latestSO && latestSO.length > 0) {
        const match = latestSO[0].sales_order_no.match(/SO-\d{4}-(\d{4})/);
        if (match) {
          nextSeq = parseInt(match[1], 10) + 1;
        }
      }
      const soNumber = `SO-${year}-${String(nextSeq).padStart(4, '0')}`;

      const { data: soData, error: soError } = await supabase
        .from('sales_orders')
        .insert({
          sales_order_no: soNumber,
          quotation_id: body.quotationId,
          customer_id: body.customerId,
          customer_name: body.customerName,
          po_number: body.poNumber,
          so_date: body.soDate,
          delivery_date: body.deliveryDate,
          delivery_address: body.deliveryAddress,
          status: body.status || 'draft',
          subtotal: body.subtotal || 0,
          tax_amount: body.taxAmount || 0,
          total_amount: body.totalAmount || 0,
          notes: body.notes,
        })
        .select()
        .single()

      if (soError) {
        console.error('Supabase error:', soError)
        return res.status(500).json({ error: soError.message })
      }

      // Insert line items
      const lineItems = body.lineItems.map((item) => ({
        sales_order_id: soData.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent || 0,
        line_total: item.lineTotal || item.quantity * item.unitPrice,
        notes: item.notes,
      }))

      const { error: itemError } = await supabase
        .from('sales_order_items')
        .insert(lineItems)

      if (itemError) {
        console.error('Supabase error:', itemError)
        return res.status(500).json({ error: itemError.message })
      }

      return res.status(201).json({
        id: soData.id,
        salesOrderNo: soData.sales_order_no,
      })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Error:', error)
    return res.status(400).json({ error: error.message || 'Invalid request' })
  }
}
