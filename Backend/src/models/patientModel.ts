import { Patient, MedicalRecord, NextVisit } from '../utils/schemas'
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
    const connection = await db

    try {
      await connection.beginTransaction()

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

      if (results && results.affectedRows === 0) {
        throw new Error('Patient creation failed')
      }

      const patientIdentification = identification // Use the provided identification as the patient identification
      const [recordResults]: any = await connection.query(
        `INSERT INTO medical_records (patient_id, general_health_status, allergies, medical_dental_history,
         consultation_reason, diagnosis, referred_by, orthodontic_observations, notes, patient_identification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      await connection.commit()

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
      await connection.rollback()
      throw error
    }
  }

  static async getPatientById(patientId: string): Promise<any | null> {
    try {
      const connection = await db
      const [patient]: any = await connection.query(
        'SELECT * FROM patients WHERE identification = ?',
        [patientId]
      )
      if (patient.length === 0) {
        return null // Patient not found
      }

      const [medicalRecord]: any = await connection.query(
        'SELECT * FROM medical_records WHERE patient_identification = ?',
        [patientId]
      )
      return {
        patient: patient[0], // Assuming the first row is the patient data
        medicalRecord: medicalRecord[0] // Assuming the first row is the medical record data
      } // Return the patient data
    } catch (error) {
      throw new Error(error)
    }
  }
  static async getAllPatients(): Promise<Patient> {
    try {
      const connection = await db
      const [patients]: any = await connection.query('SELECT * FROM patients')
      return patients // Return all patients
    } catch (error) {
      throw new Error(error)
    }
  }
  static async setNewDate(newDate: NextVisit): Promise<NextVisit> {
    const { patientId, nextVisitDate, plannedTreatment, observations } = newDate

    const connection = await db
    try {
      const [results]: any = await connection.query(
        'INSERT INTO next_visit (patient_id, scheduled_date, planned_treatment, observations) VALUES (?,?,?,?)',
        [patientId, nextVisitDate, plannedTreatment, observations]
      )

      if (results && results.affectedRows === 0) {
        throw new Error('Failed to set new date')
      }
      return {
        patientId,
        nextVisitDate,
        plannedTreatment,
        observations
      } as NextVisit // Return the new visit data
    } catch (error) {
      throw new Error(error)
    }
  }

  static async updatePatientRecord(
    patientId: string,
    updatedData: any
  ): Promise<any> {
    const connection = await db
    const { firstName, lastName, age, phone, address, city } =
      updatedData.patient

    const {
      generalHealthStatus,
      allergies,
      medicalDentalHistory,
      consultationReason,
      diagnosis,
      referredBy,
      orthodonticObservations,
      notes
    } = updatedData.medicalRecord

    try {
      await connection.beginTransaction()

      await connection.query(
        `UPDATE patients SET first_name = ?, last_name = ?, age = ?, phone = ?, address = ?, city = ?
       WHERE id = ?`,
        [firstName, lastName, age, phone, address, city, patientId]
      )
      // update medical records
      await connection.query(
        `UPDATE medical_records SET general_health_status = ?, allergies = ?, medical_dental_history = ?,
        consultation_reason = ?, diagnosis = ?, referred_by = ?, orthodontic_observations = ?, notes = ?
        WHERE patient_id = ?`,
        [
          generalHealthStatus,
          allergies,
          medicalDentalHistory,
          consultationReason,
          diagnosis,
          referredBy,
          orthodonticObservations,
          notes,
          patientId
        ]
      )

      await connection.commit()
      return { success: true }
    } catch (error) {
      await connection.rollback()
      throw error
    }
  }

  static async deletePatient(patientId: string): Promise<void> {
    const connection = await db
    try {
      await connection.beginTransaction()
      // Elimina registros relacionados primero si hay claves foráneas
      await connection.query(
        'DELETE FROM medical_records WHERE patient_identification = ?',
        [patientId]
      )
      await connection.query('DELETE FROM next_visit WHERE patient_id = ?', [
        patientId
      ])
      await connection.query('DELETE FROM invoices WHERE patient_id = ?', [
        patientId
      ])
      await connection.query('DELETE FROM patients WHERE identification = ?', [
        patientId
      ])
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    }
  }

  static async deleteNextVisit(nextVisitId: string): Promise<void> {
    const connection = await db
    try {
      const [result]: any = await connection.query(
        'DELETE FROM next_visit WHERE id = ?',
        [nextVisitId]
      )
      if (result.affectedRows === 0) {
        throw new Error('Next visit not found')
      }
    } catch (error) {
      throw new Error('Error deleting next visit')
    }
  }

  static async getNextVisit(patientId: string): Promise<NextVisit> {
    const connection = await db
    try {
      const [nextVisit]: any = await connection.query(
        'SELECT * FROM next_visit WHERE patient_id = ? ORDER BY id DESC LIMIT 1 ',
        patientId
      )

      if (nextVisit.length === 0) {
        return null // No next visit found
      }
      return nextVisit[0] // Return the next visit data
    } catch (error) {
      throw new Error(error)
    }
  }
}
