export interface Admin {
  id: string
  name: string
  password: string
}


export interface Patient {
  firstName: string 
  lastName: string 
  identification: string 
  age: number 
  phone?: string 
  address?: string 
  city?: string 
 
}
export interface MedicalRecord {
  generalHealthStatus: string
  allergies: string
  medicalDentalHistory: string
  consultationReason: string
  diagnosis: string
  referredBy: string | null
  orthodonticObservations?: string
  notes: string | null
}
