import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  admin?: any;
}

export const authenticateAdmin = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.admin = decoded; // Attach admin data to the request
    
      next(); // Proceed to the next middleware
    } catch (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
  };
};