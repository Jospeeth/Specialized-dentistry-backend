import { Patient, MedicalRecord } from '../utils/schemas'
import { v4 as uuidv4 } from 'uuid'
import db from '../config/connection'
export class PatientModel {
  static async createPatient(newPatient: {
    Patient: Patient
    medicalRecord: MedicalRecord
  }): Promise<Patient & MedicalRecord> {
    const { Patient, medicalRecord } = newPatient
    const { firstName, lastName, identification, age, phone, address, city } =
      Patient
    const {
      generalHealthStatus,
      allergies,
      medicalDentalHistory,
      consultationReason,
      diagnosis,
      referredBy,
      orthodonticObservations,
      notes
    } = medicalRecord

    try {
      const connection = await db

      const patientId = uuidv4()

      const [results]: any = await connection.query(
        'INSERT INTO patients (id, first_name, last_name, identification, age, phone, address, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          patientId,
          firstName,
          lastName,
          identification,
          age,
          phone,
          address,
          city
        ]
      )
      console.log('Patient creation result:', results[0]) // Log the result for debugging
      if (results && results.affectedRows === 0) {
        throw new Error('Patient creation failed')
      }

      const patientIdentification = identification // Use the provided identification as the patient identification
      const [recordResults]: any = await connection.query(
        'INSERT INTO medical_records (patient_id, general_health_status, allergies, medical_dental_history, consultation_reason, diagnosis, referred_by, orthodontic_observations, notes, patient_identification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          patientId,
          generalHealthStatus,
          allergies,
          medicalDentalHistory,
          consultationReason,
          diagnosis,
          referredBy,
          orthodonticObservations,
          notes,
          patientIdentification
        ]
      )

      if (recordResults && recordResults.affectedRows === 0) {
        throw new Error('Medical record creation failed')
      }

      return {
        firstName,
        lastName,
        identification,
        age,
        phone,
        address,
        city,
        patientId,
        generalHealthStatus,
        allergies,
        medicalDentalHistory,
        consultationReason,
        diagnosis,
        referredBy,
        orthodonticObservations,
        notes
      } as Patient & MedicalRecord // Return the patient and medical record data
    } catch (error) {
      console.error('Error creating patient:', error)
      throw new Error('Error creating patient')
    }
  }

  static async getPatientById(patientId: string): Promise<any | null> {
    try {
      const connection = await db
      const [rows]: any = await connection.query(
        'SELECT * FROM patients WHERE identification = ?',
        [patientId]
      )
      if (rows.length === 0) {
        return null // Patient not found
      }
      return {
        id: rows[0].identification
      } // Return the patient data
    } catch (error) {
      console.error('Error fetching patient:', error)
      throw new Error('Error fetching patient')
    }
  }
}
