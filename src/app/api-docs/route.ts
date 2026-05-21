import { ApiReference } from '@scalar/nextjs-api-reference'

const config = {
  url: '/openapi.json',
  metaData: {
    title: 'ERP RRI - API Documentation',
    description: 'REST API documentation for ERP RRI system. All endpoints require Bearer JWT authentication.',
  },
}

export const GET = ApiReference(config)
