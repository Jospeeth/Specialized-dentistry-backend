import { Router } from 'express'
import { PatientController } from '../controllers/patientController'

export const patientRoutes: Router = Router()

patientRoutes.post('/register', PatientController.createClient)
