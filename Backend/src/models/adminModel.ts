import bcrypt from 'bcrypt'
import db from './../config/connection'

// Define the Admin interface
interface Admin {
  id: number;
  name: string;
  email: string;
  password: string;
}

export class AdminModel {
  static async createAdmin({ input: any }) {
    const { name, email, hashedPassword } = input

    try {
      db.query(
        'INSERT INTO administrators (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err, results) => {
          if (err) throw err

          const newAdmin: Admin = {
            id: results.insertId,
            name,
            email,
            password: hashedPassword
          }

          return newAdmin
        }
      )
    } catch (error) {
      console.error('Error creating admin:', error)
      throw new Error('Error creating admin')
    }
  }

  static async loginAdmin({ input: any }) {
    const { email, password } = input

    try {
      db.query(
        'SELECT * FROM administrators WHERE email = ?',
        [email],
        async (err, results) => {
          if (err) throw err
          if (results.length === 0) {
            throw new Error('Admin not found')
          }

          const admin = results[0]
          const passwordMatch = await bcrypt.compare(password, admin.password)

          if (passwordMatch) {
            return admin
          }
          else
            throw new Error('Invalid password')
        }
      )
    } catch (error) {
      console.error('Error logging in admin:', error)
      throw new Error('Error logging in admin')
    }
  }
}
