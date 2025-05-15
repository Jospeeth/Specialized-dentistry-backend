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

    if (createdPatient) {
      res.status(201).json({
        success: true,
        data: createdPatient,
        message: 'Patient created successfully'
      })
      return
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create patient'
      })
      return
    }
  }

  static async getPatientById(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    try {
      const patient = await PatientModel.getPatientById(id)

      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: patient
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving patient',
        error: error.message
      })
    }
  }

  static async getAllpacients(req: Request, res: Response): Promise<void> {
    try {
      const patients = await PatientModel.getAllPatients()
      res.status(200).json({
        success: true,
        data: patients
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving patients',
        error: error.message
      })
    }
  }
  static async updateRecordPatient(req: Request, res: Response): Promise<void> {
    const newPatientRecord = req.body as Patient & MedicalRecord

    const existingPatient = await PatientModel.getPatientById(req.params.id)
    if (!existingPatient) {
      res.status(409).json({
        success: false,
        message: 'Patient does not exist'
      })
      return
    }

    const newRecordData = {
      Patient: {
        firstName: newPatientRecord.firstName,
        lastName: newPatientRecord.lastName,
        identification: newPatientRecord.identification,
        age: newPatientRecord.age,
        phone: newPatientRecord.phone,
        address: newPatientRecord.address,
        city: newPatientRecord.city
      },
      medicalRecord: {
        generalHealthStatus: newPatientRecord.generalHealthStatus,
        allergies: newPatientRecord.allergies,
        medicalDentalHistory: newPatientRecord.medicalDentalHistory,
        consultationReason: newPatientRecord.consultationReason,
        diagnosis: newPatientRecord.diagnosis,
        referredBy: newPatientRecord.referredBy,
        orthodonticObservations: newPatientRecord.orthodonticObservations,
        notes: newPatientRecord.notes
      }
    }
    console.log(newRecordData)
  }

  static async setNewDate(req: Request, res: Response): Promise<void> {
    const newVisit = req.body

    try {
      const updatedVisit = await PatientModel.setNewDate(newVisit)

      res.status(200).json({
        success: true,
        data: updatedVisit,
        message: 'New visit date set successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error setting new visit date',
        error: error.message
      })
    }
  }
}
