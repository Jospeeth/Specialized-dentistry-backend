import { Request, Response, NextFunction } from 'express'
import { Admin } from '../utils/schemas' // Adjust the import path as necessary
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  admin?: Admin
}

export const authenticateAdmin = () => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const token = req.cookies?.auth_token

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: 'Access denied. No token provided.' })
      return
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
      req.admin = decoded as Admin // Attach admin data to the request

      next() // Proceed to the next middleware
    } catch (err) {
      res
        .status(403)
        .json({ success: false, message: 'Invalid or expired token.' })
    }
  }
}
