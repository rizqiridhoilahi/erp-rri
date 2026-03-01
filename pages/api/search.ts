import { NextApiRequest, NextApiResponse } from 'next';

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
  valueEnd?: string;
}

// Mock data for different scopes
const mockData = {
  products: [
    {
      id: '1',
      name: 'Laptop Dell XPS 13',
      category: 'Elektronik',
      brand: 'Dell',
      price: 18000000,
      stock: 15,
      sku: 'DELL-XPS-13',
      description: 'Laptop ultrabook dengan spesifikasi tinggi',
      status: 'aktif',
    },
    {
      id: '2',
      name: 'Keyboard Mechanical RGB',
      category: 'Aksesori',
      brand: 'Corsair',
      price: 1200000,
      stock: 42,
      sku: 'CORSAIR-K95',
      description: 'Keyboard gaming mechanical dengan RGB lighting',
      status: 'aktif',
    },
    {
      id: '3',
      name: 'Mouse Wireless Logitech',
      category: 'Aksesori',
      brand: 'Logitech',
      price: 350000,
      stock: 0,
      sku: 'LOGI-MX-MASTER',
      description: 'Mouse wireless presisi tinggi',
      status: 'tidak aktif',
    },
  ],
  customers: [
    {
      id: '1',
      name: 'PT Maju Jaya',
      email: 'contact@majujaya.com',
      phone: '021-1234567',
      city: 'Jakarta',
      status: 'aktif',
      totalOrders: 45,
    },
    {
      id: '2',
      name: 'CV Sejahtera Mandiri',
      email: 'info@sejahtera.co.id',
      phone: '0274-567890',
      city: 'Yogyakarta',
      status: 'aktif',
      totalOrders: 23,
    },
    {
      id: '3',
      name: 'Toko Elektronik Surabaya',
      email: 'toko@elektroniksby.com',
      phone: '031-9876543',
      city: 'Surabaya',
      status: 'tidak aktif',
      totalOrders: 8,
    },
  ],
  suppliers: [
    {
      id: '1',
      name: 'PT Teknologi Maju',
      email: 'supplier@teksmaju.com',
      phone: '021-555666',
      city: 'Jakarta',
      rating: 4.8,
      totalOrders: 156,
    },
    {
      id: '2',
      name: 'CV Export Import Global',
      email: 'sales@exportglobal.co.id',
      phone: '0274-333444',
      city: 'Yogyakarta',
      rating: 4.2,
      totalOrders: 87,
    },
  ],
  quotations: [
    {
      id: '1',
      quotation_number: 'QT-2026-001',
      customer_name: 'PT Maju Jaya',
      status: 'diterima',
      amount: 25000000,
      created_at: '2026-02-28',
      items: 3,
    },
    {
      id: '2',
      quotation_number: 'QT-2026-002',
      customer_name: 'CV Sejahtera Mandiri',
      status: 'pending',
      amount: 12500000,
      created_at: '2026-02-27',
      items: 5,
    },
  ],
};

function matchesFilter(item: any, filter: SearchFilter): boolean {
  const fieldValue = String(item[filter.field] || '').toLowerCase();
  const filterValue = filter.value.toLowerCase();
  const filterValueEnd = filter.valueEnd ? filter.valueEnd.toLowerCase() : '';

  switch (filter.operator) {
    case 'equals':
      return fieldValue === filterValue;
    case 'contains':
      return fieldValue.includes(filterValue);
    case 'startsWith':
      return fieldValue.startsWith(filterValue);
    case 'endsWith':
      return fieldValue.endsWith(filterValue);
    case 'greaterThan':
      return Number(item[filter.field]) > Number(filter.value);
    case 'lessThan':
      return Number(item[filter.field]) < Number(filter.value);
    case 'between':
      const numValue = Number(item[filter.field]);
      return (
        numValue >= Number(filter.value) &&
        numValue <= Number(filterValueEnd)
      );
    case 'isEmpty':
      return !item[filter.field] || String(item[filter.field]).trim() === '';
    case 'isNotEmpty':
      return !!item[filter.field] && String(item[filter.field]).trim() !== '';
    default:
      return true;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      query,
      filters,
      scope,
      logicalOperator,
    } = req.body;

    if (!scope) {
      return res.status(400).json({ error: 'Scope is required' });
    }

    // Get data based on scope
    const scopeData: any[] = mockData[scope as keyof typeof mockData] || [];

    // Apply filters
    let results: any[] = scopeData;

    if (filters && filters.length > 0) {
      results = (scopeData as any[]).filter((item) => {
        const matchResults: boolean[] = filters.map((filter: SearchFilter) =>
          matchesFilter(item, filter)
        );

        if (logicalOperator === 'OR') {
          return matchResults.some((match: boolean) => match);
        } else {
          return matchResults.every((match: boolean) => match);
        }
      });
    }

    // Also apply text search if query is present
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(queryLower)
        );
      });
    }

    return res.status(200).json({
      success: true,
      query,
      scope,
      filters,
      logicalOperator,
      total: results.length,
      results: results.slice(0, 20), // Return max 20 results
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
