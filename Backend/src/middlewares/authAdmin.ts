import { Request, Response, NextFunction } from 'express'

import jwt from 'jsonwebtoken'

export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) return res.status(403).json({ error: 'Acceso denegado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    ;(req as Request).admin = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
}
