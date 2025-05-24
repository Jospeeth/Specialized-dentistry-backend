import { Patient, MedicalRecord, NextVisit } from '../utils/schemas'
import { v4 as uuidv4 } from 'uuid'
import connection from '../config/connection'

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

    const patientId = uuidv4()

    try {
      await connection.begin(async (connection) => {
        const [insertedPatient] = await connection`
        INSERT INTO patients (
          id, first_name, last_name, identification, age, phone, address, city
        ) VALUES (
          ${patientId}, ${firstName}, ${lastName}, ${identification},
          ${age}, ${phone}, ${address}, ${city}
        ) RETURNING *`

        if (insertedPatient === undefined || insertedPatient.length === 0) {
          throw new Error('Patient creation failed')
        }

        const [insertedRecord] = await connection`
            INSERT INTO medical_records (
              patient_id, general_health_status, allergies, medical_dental_history,
              consultation_reason, diagnosis, referred_by, orthodontic_observations,
              notes, patient_identification
            ) VALUES (
              ${patientId}, ${generalHealthStatus}, ${allergies}, ${medicalDentalHistory},
              ${consultationReason}, ${diagnosis}, ${referredBy}, ${orthodonticObservations},
              ${notes}, ${identification}
            ) RETURNING *`

        if (insertedRecord === undefined || insertedRecord.length === 0) {
          throw new Error('Medical record creation failed')
        }
      })

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
      } as Patient & MedicalRecord // Return the combined patient and medical record data
    } catch (error) {
      throw new Error('Error creating patient: ' + error.message)
    }
  }

  static async getPatientById(patientId: string): Promise<any | null> {
    try {
      const [patient]: any = await connection`
        SELECT * FROM patients WHERE identification = ${patientId};`

      if (patient === undefined || patient.length === 0) {
        return null // Patient not found
      }

      const [medicalRecord]: any = await connection`
        SELECT * FROM medical_records WHERE patient_identification = ${patientId};`

      return {
        patient: patient, // Assuming the first row is the patient data
        medicalRecord: medicalRecord // Assuming the first row is the medical record data
      } // Return the patient data
    } catch (error) {
      throw new Error(error)
    }
  }
  static async getAllPatients(): Promise<Patient> {
    try {
      const [patients]: any = await connection`SELECT * FROM patients`
      if (patients.length === 0) {
        return null // No patients found
      }
      return patients // Return all patients
    } catch (error) {
      throw new Error(error)
    }
  }
  static async setNewDate(newDate: NextVisit): Promise<NextVisit> {
    const { patientId, nextVisitDate, plannedTreatment, observations } = newDate

    try {
      const newDate: any = await connection`
       INSERT INTO next_visit (patient_id, scheduled_date, planned_treatment, observations)
       VALUES (${patientId}, ${nextVisitDate}, ${plannedTreatment}, ${observations})
      RETURNING *`

      if (newDate === undefined || newDate.length === 0) {
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
      await connection.begin(async (connection) => {
        await connection`
        UPDATE patients SET first_name = ${firstName}, last_name = ${lastName}, age = ${age},
        phone = ${phone}, address = ${address}, city = ${city} WHERE id = ${patientId}
        `
        // update medical records
        await connection`
      UPDATE medical_records SET general_health_status = ${generalHealthStatus},
      allergies = ${allergies}, medical_dental_history = ${medicalDentalHistory},
      consultation_reason = ${consultationReason}, diagnosis = ${diagnosis},
      referred_by = ${referredBy}, orthodontic_observations = ${orthodonticObservations},
      notes = ${notes} WHERE patient_id = ${patientId}
    `
      })

      // update patient information

      return { success: true }
    } catch (error) {
      throw Error('Error updating patient record: ' + error)
    }
  }

  static async deletePatient(patientId: string): Promise<void> {
    try {
      await connection.begin(async (connection) => {
        const [patientDeleted]: any = await connection`
        DELETE FROM medical_records WHERE patient_identification = ${patientId}
       RETURNING patient_id`
        const patientIdToDelete = patientDeleted.patient_id

        await connection`
        DELETE FROM next_visit WHERE patient_id = ${patientIdToDelete}
      `
        await connection`
        DELETE FROM invoices WHERE patient_id = ${patientIdToDelete}
      `
        await connection`
        DELETE FROM patients WHERE patient_id = ${patientIdToDelete}
      `
      })
    } catch (error) {
      throw new Error('Error deleting patient: ' + error)
    }
  }

  static async deleteNextVisit(nextVisitId: string): Promise<void> {
    try {
      const result = await connection`
        DELETE FROM next_visit WHERE id = ${nextVisitId} RETURNING id
      `

      if (!result.length) {
        throw new Error('Next visit not found')
      }
    } catch (error) {
      throw new Error('Error deleting next visit')
    }
  }

  static async getNextVisit(patientId: string): Promise<NextVisit | null> {
    try {
      const nextVisit = await connection`
        SELECT * FROM next_visit WHERE patient_id = ${patientId}
        ORDER BY id DESC LIMIT 1
      `

      if (nextVisit.length === 0) {
        return null
      }

      return nextVisit[0] as NextVisit // Return the most recent next visit
    } catch (error: any) {
      throw new Error(error.message || 'Error retrieving next visit')
    }
  }
}
