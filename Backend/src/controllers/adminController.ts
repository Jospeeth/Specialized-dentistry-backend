import { AdminModel } from './../models/adminModel'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export class AdminController {
  static async createAdmin(
    req: Request,
    res: Response,
    
  ): Promise<void> {
    try {
      const { name, password, secret } = req.body

      // Verificar si el secreto es incorrecto
      if (secret === process.env.ADMIN_SECRET) {
       
        const hashedPassword = await bcrypt.hash(password, 10)
        const newAdmin = {
          name,
          password: hashedPassword
        }

        const createdAdmin = await AdminModel.createAdmin(newAdmin)

        res.status(201).json({
          success: true,
          data: createdAdmin,
          message: 'Admin created successfully'
        })
      }
      else {
        console.log(secret) // Para verificar si el valor se carga correctamente

        res.status(403).json({
          success: false,
          message: 'Invalid secret'
        })
      }
    } catch (error) {
      console.error('Error in createAdmin controller:', error)
       res.status(500).json({
        success: false,
        message: 'Failed to create admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
