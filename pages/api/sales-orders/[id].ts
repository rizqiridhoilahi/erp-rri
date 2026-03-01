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
    return res.status(400).json({ error: 'Invalid sales order ID' })
  }

  try {
    if (req.method === 'GET') {
      // Get sales order detail
      const { data: soData, error: soError } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('id', id)
        .single()

      if (soError) {
        console.error('Supabase error:', soError)
        return res.status(404).json({ error: 'Sales order not found' })
      }

      // Get line items
      const { data: itemsData, error: itemsError } = await supabase
        .from('sales_order_items')
        .select('*')
        .eq('sales_order_id', id)

      if (itemsError) {
        console.error('Supabase error:', itemsError)
        return res.status(500).json({ error: itemsError.message })
      }

      return res.status(200).json({
        id: soData.id,
        salesOrderNo: soData.sales_order_no,
        quotationId: soData.quotation_id,
        customerId: soData.customer_id,
        customerName: soData.customer_name,
        poNumber: soData.po_number,
        soDate: soData.so_date,
        deliveryDate: soData.delivery_date,
        deliveryAddress: soData.delivery_address,
        status: soData.status,
        subtotal: soData.subtotal,
        taxAmount: soData.tax_amount,
        totalAmount: soData.total_amount,
        notes: soData.notes,
        lineItems: (itemsData || []).map((item: any) => ({
          id: item.id,
          salesOrderId: item.sales_order_id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          discountPercent: item.discount_percent,
          lineTotal: item.line_total,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        createdAt: soData.created_at,
        updatedAt: soData.updated_at,
      })
    } else if (req.method === 'PATCH') {
      // Update sales order
      const { status, notes } = req.body

      const { data: updatedData, error: updateError } = await supabase
        .from('sales_orders')
        .update({
          status: status || undefined,
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
        .from('sales_order_items')
        .select('*')
        .eq('sales_order_id', id)

      return res.status(200).json({
        id: updatedData.id,
        salesOrderNo: updatedData.sales_order_no,
        quotationId: updatedData.quotation_id,
        customerId: updatedData.customer_id,
        customerName: updatedData.customer_name,
        poNumber: updatedData.po_number,
        soDate: updatedData.so_date,
        deliveryDate: updatedData.delivery_date,
        deliveryAddress: updatedData.delivery_address,
        status: updatedData.status,
        subtotal: updatedData.subtotal,
        taxAmount: updatedData.tax_amount,
        totalAmount: updatedData.total_amount,
        notes: updatedData.notes,
        lineItems: (itemsData || []).map((item: any) => ({
          id: item.id,
          salesOrderId: item.sales_order_id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          discountPercent: item.discount_percent,
          lineTotal: item.line_total,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        createdAt: updatedData.created_at,
        updatedAt: updatedData.updated_at,
      })
    } else if (req.method === 'DELETE') {
      // Delete sales order
      const { error: deleteError } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Supabase error:', deleteError)
        return res.status(500).json({ error: deleteError.message })
      }

      return res.status(200).json({ message: 'Sales order deleted successfully' })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Error:', error)
    return res.status(400).json({ error: error.message || 'Invalid request' })
  }
}
