import db from './../config/connection'
  import { v4 as uuidv4 } from 'uuid'
  // Define the Admin interface
interface Admin {
  id: string
  name: string
  password: string
}

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
        'INSERT INTO administradores (id, nombre, password) VALUES (?, ?, ?)',
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
      console.error('Error creating admin:', err)
      throw new Error('Error creating admin')
    }
  }

  static async findOneAdmin(name: string): Promise<Admin | null> {
    try {
      const connection = await db 
      const [rows]: any = await connection.query(
        'SELECT * FROM administradores WHERE nombre = ?',
        [name]
      )

      if (rows.length === 0) {
        return null
      }

      return {
        id: rows[0].id,
        name: rows[0].nombre,
        password: rows[0].password
      } as Admin
    } catch (err) {
      console.error('Error finding admin:', err)
      throw new Error('Error finding admin')
    }
  }

  static async loginAdmin(name: string, password: string): Promise<Admin | null> {
    try {
     const connection = await db
      const [rows]: any = await connection.query(
      'SELECT * FROM administradores WHERE nombre = ? AND password = ?',
      [name, password]
      )
      if (rows.length === 0) {
        return null
      }
      

      return rows[0] as Admin
    } catch (err) {
      console.error('Error finding admin:', err)
      throw new Error('Error finding admin')
    }
  }
  
}
