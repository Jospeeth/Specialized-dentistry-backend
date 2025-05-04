import { AdminModel } from './../models/adminModel'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


export class AdminController {
  static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { name, password, secret } = req.body

      if (secret === process.env.ADMIN_SECRET) {
        const existingAdmin = await AdminModel.findOneAdmin(name)
        if (existingAdmin) {
          res.status(409).json({
            success: false,
            message: 'Admin already exists'
          })
          return
        }

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
      } else {
        res.status(403).json({
          success: false,
          message: 'Invalid secret'
        })
        return
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

  static async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { name, password } = req.body
      const existingAdmin = await AdminModel.findOneAdmin(name)
      if (!existingAdmin) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
        return
      }
       
      const { id: id, name: nameAdmin, password: hashedPassword } = existingAdmin
      const isPasswordValid = await bcrypt.compare(password, hashedPassword)
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
        return
      }
      const token = jwt.sign(
        { id: id, name: nameAdmin },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1d'
        }
      )

      res
        .cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000
        })
        .send({
          message: 'Login successful',
          name: name,
          success: true,
          token
        })

    
    } catch (error) {
      console.error('Error in loginAdmin controller:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to login admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
