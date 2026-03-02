import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { CustomerContract, CustomerProductContract } from '@/types/contact'

export function useContracts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============ CUSTOMER CONTRACTS ============

  const getContractsByCustomer = useCallback(
    async (customerId: string): Promise<CustomerContract[]> => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('customers_contracts')
          .select('*')
          .eq('customer_id', customerId)
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError

        return data?.map((contract) => ({
          id: contract.id,
          customerId: contract.customer_id,
          contractNumber: contract.contract_number,
          contractDate: contract.contract_date,
          startDate: contract.start_date,
          endDate: contract.end_date,
          description: contract.description || '',
          fileUrl: contract.file_url || '',
          status: contract.status,
          notes: contract.notes || '',
          createdAt: contract.created_at,
          updatedAt: contract.updated_at,
        })) || []
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil data kontrak'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getAllContracts = useCallback(
    async (): Promise<CustomerContract[]> => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('customers_contracts')
          .select('*')
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError

        return data?.map((contract) => ({
          id: contract.id,
          customerId: contract.customer_id,
          contractNumber: contract.contract_number,
          contractDate: contract.contract_date,
          startDate: contract.start_date,
          endDate: contract.end_date,
          description: contract.description || '',
          fileUrl: contract.file_url || '',
          status: contract.status,
          notes: contract.notes || '',
          createdAt: contract.created_at,
          updatedAt: contract.updated_at,
        })) || []
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil data kontrak'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const createContract = useCallback(
    async (data: Omit<CustomerContract, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true)
      setError(null)

      try {
        const { data: newContract, error: supabaseError } = await supabase
          .from('customers_contracts')
          .insert({
            customer_id: data.customerId,
            contract_number: data.contractNumber,
            contract_date: data.contractDate,
            start_date: data.startDate,
            end_date: data.endDate,
            description: data.description,
            file_url: data.fileUrl,
            status: data.status,
            notes: data.notes,
          })
          .select()
          .single()

        if (supabaseError) throw supabaseError

        return {
          id: newContract.id,
          customerId: newContract.customer_id,
          contractNumber: newContract.contract_number,
          contractDate: newContract.contract_date,
          startDate: newContract.start_date,
          endDate: newContract.end_date,
          description: newContract.description || '',
          fileUrl: newContract.file_url || '',
          status: newContract.status,
          notes: newContract.notes || '',
          createdAt: newContract.created_at,
          updatedAt: newContract.updated_at,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal membuat kontrak baru'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateContract = useCallback(
    async (id: string, data: Partial<CustomerContract>) => {
      setLoading(true)
      setError(null)

      try {
        const { data: updated, error: supabaseError } = await supabase
          .from('customers_contracts')
          .update({
            contract_number: data.contractNumber,
            contract_date: data.contractDate,
            start_date: data.startDate,
            end_date: data.endDate,
            description: data.description,
            file_url: data.fileUrl,
            status: data.status,
            notes: data.notes,
          })
          .eq('id', id)
          .select()
          .single()

        if (supabaseError) throw supabaseError

        return {
          id: updated.id,
          customerId: updated.customer_id,
          contractNumber: updated.contract_number,
          contractDate: updated.contract_date,
          startDate: updated.start_date,
          endDate: updated.end_date,
          description: updated.description || '',
          fileUrl: updated.file_url || '',
          status: updated.status,
          notes: updated.notes || '',
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memperbarui kontrak'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteContract = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error: supabaseError } = await supabase
        .from('customers_contracts')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus kontrak'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ============ CUSTOMER PRODUCT CONTRACTS ============

  const getProductContractsByCustomer = useCallback(
    async (customerId: string): Promise<CustomerProductContract[]> => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('customer_product_contracts')
          .select('*')
          .eq('customer_id', customerId)
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError

        return data?.map((contract) => ({
          id: contract.id,
          customerId: contract.customer_id,
          contractId: contract.contract_id || '',
          productId: contract.product_id,
          contractPrice: contract.contract_price,
          startDate: contract.start_date,
          endDate: contract.end_date,
          notes: contract.notes || '',
          createdAt: contract.created_at,
          updatedAt: contract.updated_at,
        })) || []
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil data kontrak produk'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getProductContractsByContract = useCallback(
    async (contractId: string): Promise<CustomerProductContract[]> => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('customer_product_contracts')
          .select('*')
          .eq('contract_id', contractId)
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError

        return data?.map((contract) => ({
          id: contract.id,
          customerId: contract.customer_id,
          contractId: contract.contract_id || '',
          productId: contract.product_id,
          contractPrice: contract.contract_price,
          startDate: contract.start_date,
          endDate: contract.end_date,
          notes: contract.notes || '',
          createdAt: contract.created_at,
          updatedAt: contract.updated_at,
        })) || []
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil data kontrak produk'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const createProductContract = useCallback(
    async (data: Omit<CustomerProductContract, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true)
      setError(null)

      try {
        const { data: newContract, error: supabaseError } = await supabase
          .from('customer_product_contracts')
          .insert({
            customer_id: data.customerId,
            contract_id: data.contractId || null,
            product_id: data.productId,
            contract_price: data.contractPrice,
            start_date: data.startDate,
            end_date: data.endDate,
            notes: data.notes,
          })
          .select()
          .single()

        if (supabaseError) throw supabaseError

        return {
          id: newContract.id,
          customerId: newContract.customer_id,
          contractId: newContract.contract_id || '',
          productId: newContract.product_id,
          contractPrice: newContract.contract_price,
          startDate: newContract.start_date,
          endDate: newContract.end_date,
          notes: newContract.notes || '',
          createdAt: newContract.created_at,
          updatedAt: newContract.updated_at,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal membuat kontrak produk'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateProductContract = useCallback(
    async (id: string, data: Partial<CustomerProductContract>) => {
      setLoading(true)
      setError(null)

      try {
        const { data: updated, error: supabaseError } = await supabase
          .from('customer_product_contracts')
          .update({
            contract_price: data.contractPrice,
            start_date: data.startDate,
            end_date: data.endDate,
            notes: data.notes,
          })
          .eq('id', id)
          .select()
          .single()

        if (supabaseError) throw supabaseError

        return {
          id: updated.id,
          customerId: updated.customer_id,
          contractId: updated.contract_id || '',
          productId: updated.product_id,
          contractPrice: updated.contract_price,
          startDate: updated.start_date,
          endDate: updated.end_date,
          notes: updated.notes || '',
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memperbarui kontrak produk'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteProductContract = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error: supabaseError } = await supabase
        .from('customer_product_contracts')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus kontrak produk'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get product price with contract
  const getProductPrice = useCallback(
    async (customerId: string, productId: string): Promise<number> => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase.rpc('get_product_price', {
          p_customer_id: customerId,
          p_product_id: productId,
        })

        if (supabaseError) throw supabaseError

        return data || 0
      } catch (err) {
        // If RPC doesn't exist, try direct query
        try {
          const { data: contractData } = await supabase
            .from('customer_product_contracts')
            .select('contract_price')
            .eq('customer_id', customerId)
            .eq('product_id', productId)
            .lte('start_date', new Date().toISOString().split('T')[0])
            .gte('end_date', new Date().toISOString().split('T')[0])
            .limit(1)
            .single()

          return contractData?.contract_price || 0
        } catch {
          return 0
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    loading,
    error,
    // Customer Contracts
    getContractsByCustomer,
    getAllContracts,
    createContract,
    updateContract,
    deleteContract,
    // Customer Product Contracts
    getProductContractsByCustomer,
    getProductContractsByContract,
    createProductContract,
    updateProductContract,
    deleteProductContract,
    // Price helper
    getProductPrice,
  }
}
