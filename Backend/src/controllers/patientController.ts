import { Request, Response } from 'express'
import { PatientModel } from '../models/patientModel'
import { Patient, MedicalRecord } from '../utils/schemas'

export class PatientController {
  static async createClient(req: Request, res: Response): Promise<void> {
    const newPatient = req.body as Patient & MedicalRecord

    const existingPatient = await PatientModel.getPatientById(
      req.body.identification
    )
    if (existingPatient) {
      res.status(409).json({
        success: false,
        message: 'Patient already exists'
      })
      return
    }

    const newPatientData = {
      Patient: {
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        identification: newPatient.identification,
        age: newPatient.age,
        phone: newPatient.phone,
        address: newPatient.address,
        city: newPatient.city
      },
      medicalRecord: {
        generalHealthStatus: newPatient.generalHealthStatus,
        allergies: newPatient.allergies,
        medicalDentalHistory: newPatient.medicalDentalHistory,
        consultationReason: newPatient.consultationReason,
        diagnosis: newPatient.diagnosis,
        referredBy: newPatient.referredBy,
        orthodonticObservations: newPatient.orthodonticObservations,
        notes: newPatient.notes
      }
    }

    const createdPatient = await PatientModel.createPatient(newPatientData)

    res.status(201).json({
      success: true,
      data: createdPatient,
      message: 'Patient created successfully'
    })

    res.status(500).json({
      success: false,
      message: 'Failed to create patient'
    })
  }
}
