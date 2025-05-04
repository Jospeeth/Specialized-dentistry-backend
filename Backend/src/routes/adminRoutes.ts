import { Router } from 'express'
import { AdminController } from './../controllers/adminController'

export const adminRoutes: Router = Router()

adminRoutes.post('/create', AdminController.createAdmin)
adminRoutes.post('/login', AdminController.loginAdmin);
