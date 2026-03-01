import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

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
    return res.status(400).json({ error: 'Invalid delivery order ID' })
  }

  try {
    if (req.method === 'GET') {
      // Get delivery order detail
      const { data: doData, error: doError } = await supabase
        .from('delivery_orders')
        .select('*')
        .eq('id', id)
        .single()

      if (doError) {
        console.error('Supabase error:', doError)
        return res.status(404).json({ error: 'Delivery order not found' })
      }

      // Get line items
      const { data: itemsData, error: itemsError } = await supabase
        .from('delivery_order_items')
        .select('*')
        .eq('delivery_order_id', id)

      if (itemsError) {
        console.error('Supabase error:', itemsError)
        return res.status(500).json({ error: itemsError.message })
      }

      // Get documents
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('delivery_order_id', id)

      return res.status(200).json({
        id: doData.id,
        deliveryOrderNo: doData.delivery_order_no,
        salesOrderId: doData.sales_order_id,
        salesOrderNo: doData.sales_order_no,
        customerId: doData.customer_id,
        customerName: doData.customer_name,
        deliveryDate: doData.delivery_date,
        actualDeliveryDate: doData.actual_delivery_date,
        deliveryAddress: doData.delivery_address,
        recipient: doData.recipient,
        recipientPhone: doData.recipient_phone,
        status: doData.status,
        notes: doData.notes,
        lineItems: (itemsData || []).map((item: any) => ({
          id: item.id,
          deliveryOrderId: item.delivery_order_id,
          productId: item.product_id,
          productName: item.product_name,
          soLineItemId: item.so_line_item_id,
          quantity: item.quantity,
          receivedQuantity: item.received_quantity,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        documents: (docsData || []).map((doc: any) => ({
          id: doc.id,
          deliveryOrderId: doc.delivery_order_id,
          documentType: doc.document_type,
          filename: doc.filename,
          fileUrl: doc.file_url,
          uploadedAt: doc.created_at,
          uploadedBy: doc.uploaded_by,
          notes: doc.notes,
        })),
        createdAt: doData.created_at,
        updatedAt: doData.updated_at,
      })
    } else if (req.method === 'PATCH') {
      // Update delivery order
      const { status, actualDeliveryDate, recipient, recipientPhone, notes } = req.body

      const { data: updatedData, error: updateError } = await supabase
        .from('delivery_orders')
        .update({
          status: status || undefined,
          actual_delivery_date: actualDeliveryDate || undefined,
          recipient: recipient !== undefined ? recipient : undefined,
          recipient_phone: recipientPhone !== undefined ? recipientPhone : undefined,
          notes: notes !== undefined ? notes : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Supabase error:', updateError)
        return res.status(500).json({ error: updateError.message })
      }

      // Get line items
      const { data: itemsData } = await supabase
        .from('delivery_order_items')
        .select('*')
        .eq('delivery_order_id', id)

      // Get documents
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('delivery_order_id', id)

      return res.status(200).json({
        id: updatedData.id,
        deliveryOrderNo: updatedData.delivery_order_no,
        salesOrderId: updatedData.sales_order_id,
        salesOrderNo: updatedData.sales_order_no,
        customerId: updatedData.customer_id,
        customerName: updatedData.customer_name,
        deliveryDate: updatedData.delivery_date,
        actualDeliveryDate: updatedData.actual_delivery_date,
        deliveryAddress: updatedData.delivery_address,
        recipient: updatedData.recipient,
        recipientPhone: updatedData.recipient_phone,
        status: updatedData.status,
        notes: updatedData.notes,
        lineItems: (itemsData || []).map((item: any) => ({
          id: item.id,
          deliveryOrderId: item.delivery_order_id,
          productId: item.product_id,
          productName: item.product_name,
          soLineItemId: item.so_line_item_id,
          quantity: item.quantity,
          receivedQuantity: item.received_quantity,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        documents: (docsData || []).map((doc: any) => ({
          id: doc.id,
          deliveryOrderId: doc.delivery_order_id,
          documentType: doc.document_type,
          filename: doc.filename,
          fileUrl: doc.file_url,
          uploadedAt: doc.created_at,
          uploadedBy: doc.uploaded_by,
          notes: doc.notes,
        })),
        createdAt: updatedData.created_at,
        updatedAt: updatedData.updated_at,
      })
    } else if (req.method === 'DELETE') {
      // Delete delivery order
      const { error: deleteError } = await supabase
        .from('delivery_orders')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Supabase error:', deleteError)
        return res.status(500).json({ error: deleteError.message })
      }

      return res.status(200).json({ message: 'Delivery order deleted successfully' })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Error:', error)
    return res.status(400).json({ error: error.message || 'Invalid request' })
  }
}
