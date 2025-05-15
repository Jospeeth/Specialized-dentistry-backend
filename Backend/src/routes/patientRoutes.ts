import { Router } from 'express'
import { PatientController } from '../controllers/patientController'

export const patientRoutes: Router = Router()

patientRoutes.get('/', PatientController.getAllpacients)
patientRoutes.get('/:id', PatientController.getPatientById)

patientRoutes.post('/register', PatientController.createClient)
patientRoutes.post('/new-date', PatientController.setNewDate)


patientRoutes.patch('/update/:id', PatientController.updateRecordPatient)
 