import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionSTring = process.env.DATABASE_URL

if (!connectionSTring) {
  throw new Error('DATABASE_URL is not defined in .env file')
}
const connection = postgres(connectionSTring, {
  max: 1,
  idle_timeout: 5,
  ssl: {
    rejectUnauthorized: false,
  },
})

export default connection
