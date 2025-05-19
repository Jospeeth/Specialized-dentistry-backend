import db from './../config/connection'
import { v4 as uuidv4 } from 'uuid'
import { Admin } from '../utils/schemas'
export class AdminModel {
  static async createAdmin(newAdmin: {
    name: string
    password: string
  }): Promise<Admin> {
    const { name, password } = newAdmin
    const id = uuidv4().substring(0, 8)
    try {
      const connection = await db // Esperar a que la conexión se resuelva
      const [results]: any = await connection.query(
        'INSERT INTO administrators (id, name, password) VALUES (?, ?, ?)',
        [id, name, password]
      )

      if (results && results.affectedRows === 0) {
        throw new Error('Admin creation failed')
      }

      return {
        id,
        name,
        password
      }
    } catch (err) {
      throw new Error('Error creating admin')
    }
  }

  static async findOneAdmin(name: string): Promise<Admin | null> {
    try {
      const connection = await db
      const [rows]: any = await connection.query(
        'SELECT * FROM administrators WHERE name = ?',
        [name]
      )

      if (rows.length === 0) {
        return null
      }
      // Debugging information removed to avoid exposing sensitive data
      return rows[0] as Admin
    } catch (err) {
      throw new Error('Error finding admin')
    }
  }

}
