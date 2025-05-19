import { Request, Response } from 'express'
import { PatientModel } from '../models/patientModel'
import { Patient, MedicalRecord } from '../utils/schemas'

export class PatientController {
  static async createClient(req: Request, res: Response): Promise<void> {
    const newPatient = req.body as Patient & MedicalRecord

    try {
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
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create patient',
        error: error instanceof Error ? error.message : 'Unknown error'
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
    const patientId = existingPatient.patient.id

    try {
      await PatientModel.updatePatientRecord(patientId, newPatientRecord)

      res.status(200).json({
        success: true,
        message: 'Patient record updated successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating patient record',
        error: error.message
      })
    }
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
  

  static async deletePatient(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    try {
      const existingPatient = await PatientModel.getPatientById(id)
      if (!existingPatient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found'
        })
        return
      }
      await PatientModel.deletePatient(id)
      res.status(200).json({
        success: true,
        message: 'Patient deleted successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting patient',
        error: error.message
      })
    }
  }

  static async deleteNextVisit(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    try {
      await PatientModel.deleteNextVisit(id)
      res.status(200).json({
        success: true,
        message: 'Next visit deleted successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting next visit',
        error: error.message
      })
    }
  }
}
