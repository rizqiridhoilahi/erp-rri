import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { deliveryOrderFiltersSchema, deliveryOrderSchema } from '@/lib/validations/delivery-order'

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
      // List delivery orders dengan filters
      const filters = deliveryOrderFiltersSchema.parse(req.query)

      let query = supabase
        .from('delivery_orders')
        .select(
          'id, delivery_order_no, sales_order_id, sales_order_no, customer_id, customer_name, delivery_date, actual_delivery_date, delivery_address, recipient, recipient_phone, status, notes, created_at, updated_at'
        )

      // Apply filters
      if (filters.search) {
        query = query.ilike('delivery_order_no', `%${filters.search}%`)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      if (filters.salesOrderId) {
        query = query.eq('sales_order_id', filters.salesOrderId)
      }

      if (filters.dateFrom) {
        query = query.gte('delivery_date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('delivery_date', filters.dateTo)
      }

      // Sorting & pagination
      query = query
        .order(filters.sortBy === 'deliveryDate' ? 'delivery_date' : 'created_at', {
          ascending: filters.sortOrder === 'asc',
        })
        .range((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({
        data: (data || []).map((do_: any) => ({
          id: do_.id,
          deliveryOrderNo: do_.delivery_order_no,
          salesOrderId: do_.sales_order_id,
          salesOrderNo: do_.sales_order_no,
          customerId: do_.customer_id,
          customerName: do_.customer_name,
          deliveryDate: do_.delivery_date,
          actualDeliveryDate: do_.actual_delivery_date,
          deliveryAddress: do_.delivery_address,
          recipient: do_.recipient,
          recipientPhone: do_.recipient_phone,
          status: do_.status,
          notes: do_.notes,
          createdAt: do_.created_at,
          updatedAt: do_.updated_at,
        })),
        pagination: {
          page: filters.page,
          pageSize: filters.pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / filters.pageSize),
        },
      })
    } else if (req.method === 'POST') {
      // Create new delivery order
      const body = deliveryOrderSchema.parse(req.body)

      // Generate DO number (sequential: DO-YYYY-0001)
      const year = new Date().getFullYear();
      // Get latest DO number for this year
      const { data: latestDO, error: latestError } = await supabase
        .from('delivery_orders')
        .select('delivery_order_no')
        .ilike('delivery_order_no', `DO-${year}-%`)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextSeq = 1;
      if (latestDO && latestDO.length > 0) {
        const match = latestDO[0].delivery_order_no.match(/DO-\d{4}-(\d{4})/);
        if (match) {
          nextSeq = parseInt(match[1], 10) + 1;
        }
      }
      const doNumber = `DO-${year}-${String(nextSeq).padStart(4, '0')}`;

      const { data: doData, error: doError } = await supabase
        .from('delivery_orders')
        .insert({
          delivery_order_no: doNumber,
          sales_order_id: body.salesOrderId,
          customer_id: body.customerId,
          customer_name: body.customerName,
          delivery_date: body.deliveryDate,
          delivery_address: body.deliveryAddress,
          recipient: body.recipient,
          recipient_phone: body.recipientPhone,
          status: body.status || 'draft',
          notes: body.notes,
        })
        .select()
        .single()

      if (doError) {
        console.error('Supabase error:', doError)
        return res.status(500).json({ error: doError.message })
      }

      // Insert line items
      const lineItems = body.lineItems.map((item) => ({
        delivery_order_id: doData.id,
        product_id: item.productId,
        product_name: item.productName,
        so_line_item_id: item.soLineItemId,
        quantity: item.quantity,
        received_quantity: item.receivedQuantity || 0,
        notes: item.notes,
      }))

      const { error: itemError } = await supabase
        .from('delivery_order_items')
        .insert(lineItems)

      if (itemError) {
        console.error('Supabase error:', itemError)
        return res.status(500).json({ error: itemError.message })
      }

      // Insert documents if any
      if (body.documents && body.documents.length > 0) {
        const documents = body.documents.map((doc) => ({
          delivery_order_id: doData.id,
          document_type: doc.documentType,
          filename: doc.filename,
          file_url: doc.fileUrl,
          notes: doc.notes,
        }))

        const { error: docError } = await supabase
          .from('documents')
          .insert(documents)

        if (docError) {
          console.error('Supabase error:', docError)
          // Don't fail the request, just log the error
        }
      }

      return res.status(201).json({
        id: doData.id,
        deliveryOrderNo: doData.delivery_order_no,
      })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Error:', error)
    return res.status(400).json({ error: error.message || 'Invalid request' })
  }
}
