const config = {
  development: {
    apiBaseUrl: 'http://localhost:8080/api',
  },
  production: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://fitness-backend-production-7084.up.railway.app/api',
  },
}

const environment = process.env.NODE_ENV || 'development'
export const currentConfig = config[environment] 