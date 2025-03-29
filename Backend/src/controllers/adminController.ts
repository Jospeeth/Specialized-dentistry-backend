import { AdminModel } from './../models/adminModel'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt' 
import jwt from 'jsonwebtoken'
export class AdminController {
  async createAdmin(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      const hashedPassword = await bcrypt.hash(password, 10)
      const newAdmin = {
        name,
        email,
        password: hashedPassword
      }
      const createdAdmin = await AdminModel.createAdmin({ input: newAdmin })

      res.status(201).json(createdAdmin)
    } catch (error) {
      res.status(500).json({ message: 'Error creating admin', error })
    }
  }

  async loginAdmin(req: Request, res: Response) {
    try {
      const adimInfo = req.body
      const admin = await AdminModel.loginAdmin({ input: adimInfo })
      if (admin){
        const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1d'
        }
      )

      res.json({ message: 'Login exitoso', token })
      }
        return res.status(401).json({ error: 'incorrect password' })

     

  }
}
}