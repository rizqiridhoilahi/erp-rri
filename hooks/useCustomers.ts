import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { Customer } from '@/types/contact'
import type { CustomerFiltersInput } from '@/lib/validations/contact'

interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useCustomers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getList = useCallback(
    async (
      page: number = 1,
      pageSize: number = 10,
      filters?: CustomerFiltersInput
    ): Promise<CustomerListResponse> => {
      setLoading(true)
      setError(null)

      try {
        // Build query
        let query = supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .is('deleted_at', null)

        // Apply search filter
        if (filters?.search) {
          const searchTerm = `%${filters.search}%`
          query = query.or(
            `name.ilike.${searchTerm},code.ilike.${searchTerm},email.ilike.${searchTerm}`
          )
        }

        // Apply type filter
        if (filters?.type) {
          query = query.eq('type', filters.type)
        }

        // Apply city filter
        if (filters?.city) {
          query = query.eq('city', filters.city)
        }

        // Apply status filter
        if (filters?.status) {
          query = query.eq('status', filters.status)
        }

        // Apply sorting
        const sortBy = filters?.sortBy || 'created_at'
        const sortOrder = filters?.sortOrder || 'desc'
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // Apply pagination
        const start = (page - 1) * pageSize
        query = query.range(start, start + pageSize - 1)

        const { data, error: supabaseError, count } = await query

        if (supabaseError) throw supabaseError

        const total = count || 0
        const totalPages = Math.ceil(total / pageSize)

        const customers: Customer[] = data?.map((customer) => ({
          id: customer.id,
          code: customer.code,
          name: customer.name,
          type: customer.type,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          province: customer.province,
          postalCode: customer.postal_code,
          country: customer.country,
          taxId: customer.tax_id,
          taxName: customer.tax_name,
          taxAddress: customer.tax_address,
          companyName: customer.company_name,
          // PIC fields (business type)
          picName: customer.pic_name,
          picEmail: customer.pic_email,
          picPhone: customer.pic_phone,
          // Storage addresses (business type)
          storageAddress1: customer.storage_address_1,
          storageAddress2: customer.storage_address_2,
          storageAddress3: customer.storage_address_3,
          storageAddress4: customer.storage_address_4,
          storageAddress5: customer.storage_address_5,
          // Contract fields
          hasContract: customer.has_contract,
          contractId: customer.contract_id,
          contractNumber: customer.contract_number,
          contractFileUrl: customer.contract_file_url,
          notes: customer.notes,
          status: customer.status,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
        })) || []

        return {
          data: customers,
          total,
          page,
          pageSize,
          totalPages,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil data pelanggan'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getOne = useCallback(async (id: string): Promise<Customer | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (supabaseError) throw supabaseError

      if (!data) return null

      return {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postal_code,
        country: data.country,
        taxId: data.tax_id,
        taxName: data.tax_name,
        taxAddress: data.tax_address,
        companyName: data.company_name,
        picName: data.pic_name,
        picEmail: data.pic_email,
        picPhone: data.pic_phone,
        storageAddress1: data.storage_address_1,
        storageAddress2: data.storage_address_2,
        storageAddress3: data.storage_address_3,
        storageAddress4: data.storage_address_4,
        storageAddress5: data.storage_address_5,
        hasContract: data.has_contract,
        contractId: data.contract_id,
        contractNumber: data.contract_number,
        contractFileUrl: data.contract_file_url,
        notes: data.notes,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil data pelanggan'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(
    async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true)
      setError(null)

      try {
        const { data: newCustomer, error: supabaseError } = await supabase
          .from('customers')
          .insert({
            code: data.code,
            name: data.name,
            type: data.type,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            province: data.province,
            postal_code: data.postalCode,
            country: data.country,
            tax_id: data.taxId,
            tax_name: data.taxName,
            tax_address: data.taxAddress,
            company_name: data.companyName,
            pic_name: data.picName,
            pic_email: data.picEmail,
            pic_phone: data.picPhone,
            storage_address_1: data.storageAddress1,
            storage_address_2: data.storageAddress2,
            storage_address_3: data.storageAddress3,
            storage_address_4: data.storageAddress4,
            storage_address_5: data.storageAddress5,
            has_contract: data.hasContract,
            contract_id: data.contractId,
            contract_number: data.contractNumber,
            contract_file_url: data.contractFileUrl,
            notes: data.notes,
            status: data.status,
          })
          .select()
          .single()

        if (supabaseError) throw supabaseError

        return {
          id: newCustomer.id,
          code: newCustomer.code,
          name: newCustomer.name,
          type: newCustomer.type,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          city: newCustomer.city,
          province: newCustomer.province,
          postalCode: newCustomer.postal_code,
          country: newCustomer.country,
          taxId: newCustomer.tax_id,
          taxName: newCustomer.tax_name,
          taxAddress: newCustomer.tax_address,
          companyName: newCustomer.company_name,
          picName: newCustomer.pic_name,
          picEmail: newCustomer.pic_email,
          picPhone: newCustomer.pic_phone,
          storageAddress1: newCustomer.storage_address_1,
          storageAddress2: newCustomer.storage_address_2,
          storageAddress3: newCustomer.storage_address_3,
          storageAddress4: newCustomer.storage_address_4,
          storageAddress5: newCustomer.storage_address_5,
          hasContract: newCustomer.has_contract,
          contractId: newCustomer.contract_id,
          contractNumber: newCustomer.contract_number,
          contractFileUrl: newCustomer.contract_file_url,
          notes: newCustomer.notes,
          status: newCustomer.status,
          createdAt: newCustomer.created_at,
          updatedAt: newCustomer.updated_at,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal membuat pelanggan baru'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const update = useCallback(
    async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => {
      setLoading(true)
      setError(null)

      try {
        const updateData: Record<string, any> = {}

        if (data.code !== undefined) updateData.code = data.code
        if (data.name !== undefined) updateData.name = data.name
        if (data.type !== undefined) updateData.type = data.type
        if (data.email !== undefined) updateData.email = data.email
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.address !== undefined) updateData.address = data.address
        if (data.city !== undefined) updateData.city = data.city
        if (data.province !== undefined) updateData.province = data.province
        if (data.postalCode !== undefined) updateData.postal_code = data.postalCode
        if (data.country !== undefined) updateData.country = data.country
        if (data.taxId !== undefined) updateData.tax_id = data.taxId
        if (data.taxName !== undefined) updateData.tax_name = data.taxName
        if (data.taxAddress !== undefined) updateData.tax_address = data.taxAddress
        if (data.companyName !== undefined) updateData.company_name = data.companyName
        if (data.picName !== undefined) updateData.pic_name = data.picName
        if (data.picEmail !== undefined) updateData.pic_email = data.picEmail
        if (data.picPhone !== undefined) updateData.pic_phone = data.picPhone
        if (data.storageAddress1 !== undefined) updateData.storage_address_1 = data.storageAddress1
        if (data.storageAddress2 !== undefined) updateData.storage_address_2 = data.storageAddress2
        if (data.storageAddress3 !== undefined) updateData.storage_address_3 = data.storageAddress3
        if (data.storageAddress4 !== undefined) updateData.storage_address_4 = data.storageAddress4
        if (data.storageAddress5 !== undefined) updateData.storage_address_5 = data.storageAddress5
        if (data.hasContract !== undefined) updateData.has_contract = data.hasContract
        if (data.contractId !== undefined) updateData.contract_id = data.contractId
        if (data.contractNumber !== undefined) updateData.contract_number = data.contractNumber
        if (data.contractFileUrl !== undefined) updateData.contract_file_url = data.contractFileUrl
        if (data.notes !== undefined) updateData.notes = data.notes
        if (data.status !== undefined) updateData.status = data.status

        const { data: updated, error: supabaseError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (supabaseError) throw supabaseError

        return {
          id: updated.id,
          code: updated.code,
          name: updated.name,
          type: updated.type,
          email: updated.email,
          phone: updated.phone,
          address: updated.address,
          city: updated.city,
          province: updated.province,
          postalCode: updated.postal_code,
          country: updated.country,
          taxId: updated.tax_id,
          taxName: updated.tax_name,
          taxAddress: updated.tax_address,
          companyName: updated.company_name,
          picName: updated.pic_name,
          picEmail: updated.pic_email,
          picPhone: updated.pic_phone,
          storageAddress1: updated.storage_address_1,
          storageAddress2: updated.storage_address_2,
          storageAddress3: updated.storage_address_3,
          storageAddress4: updated.storage_address_4,
          storageAddress5: updated.storage_address_5,
          hasContract: updated.has_contract,
          contractId: updated.contract_id,
          contractNumber: updated.contract_number,
          contractFileUrl: updated.contract_file_url,
          notes: updated.notes,
          status: updated.status,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memperbarui pelanggan'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const delete_ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      // Soft delete
      const { error: supabaseError } = await supabase
        .from('customers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (supabaseError) throw supabaseError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus pelanggan'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getFilterOptions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get unique cities
      const { data: cityData } = await supabase
        .from('customers')
        .select('city')
        .is('deleted_at', null)

      const cities = cityData
        ? [...new Set(cityData.map((c) => c.city).filter(Boolean))].sort()
        : []

      // Get unique types
      const { data: typeData } = await supabase
        .from('customers')
        .select('type')
        .is('deleted_at', null)

      const types = typeData
        ? [...new Set(typeData.map((t) => t.type).filter(Boolean))]
        : []

      // Get unique statuses
      const { data: statusData } = await supabase
        .from('customers')
        .select('status')
        .is('deleted_at', null)

      const statuses = statusData
        ? [...new Set(statusData.map((s) => s.status).filter(Boolean))]
        : []

      return {
        cities,
        types: types as Array<'individual' | 'business'>,
        statuses: statuses as Array<'active' | 'inactive'>,
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengambil opsi filter pelanggan'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getList,
    getOne,
    create,
    update,
    delete: delete_,
    getFilterOptions,
  }
}
