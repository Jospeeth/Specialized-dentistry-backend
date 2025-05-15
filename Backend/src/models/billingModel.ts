import db from '../config/connection'
import { Invoices, TreatmentBudget, AccountStatus } from '../utils/schemas'

export class BillingModel {
  static async createInvoiceAndBudget(
    invoice: Invoices,
    treatmentBudget: TreatmentBudget[]
  ): Promise<any> {
    const conn = await db
    const { patientId, total, paid } = invoice

    try {
      await conn.beginTransaction()

      const [activeInvoices]: any = await conn.query(
        'SELECT id FROM invoices WHERE patient_id = ? AND status = "active"',
        [patientId]
      )

      if (activeInvoices.length > 0) {
        throw new Error('El paciente ya tiene una factura activa')
      }

      const [invoiceResult] = await conn.query(
        'INSERT INTO invoices (patient_id, total, paid, status) VALUES (?, ?, ?, "active")',
        [patientId, total, paid]
      )

      const invoiceId = (invoiceResult as any).insertId

      for (const item of treatmentBudget) {
        await conn.query(
          'INSERT INTO treatment_budget (invoice_id, details, value) VALUES (?, ?, ?)',
          [invoiceId, item.details, item.value]
        )
      }

      await conn.commit()

      return { invoiceId }
    } catch (error) {
      await conn.rollback()
      throw error
    }
  }

  static async createAccountStatus(
    AccountStatus: AccountStatus
  ): Promise<AccountStatus> {
    const conn = await db
    const { patientId, details, pay, paymentMethod } = AccountStatus

    try {
      await conn.beginTransaction()

      const [invoices]: any = await conn.query(
        `SELECT id, total, paid 
         FROM invoices 
         WHERE patient_id = ? AND status = 'active' 
         LIMIT 1`,
        [patientId]
      )

      if (invoices.length === 0) {
        const history: any = this.getAccountStatusByPatientId(patientId)

        if (history.length === 0) {
          new Error('No hay facturas activas para este paciente')
        }
        await conn.commit()
        return history
      }

      const invoice = invoices[0]
      const invoiceId = invoice.id
      const newPaidAmount = invoice.paid + pay
      if (pay <= 0 && newPaidAmount <= 0) {
        throw new Error('El monto del pago debe ser positivo ')
      }

      if (newPaidAmount > invoice.total) {
        throw new Error('El pago excede el monto total de la factura')
      }

      await conn.query('UPDATE invoices SET paid = paid + ? WHERE id = ?', [
        pay,
        invoiceId
      ])

      const [updatedInvoiceResult]: any = await conn.query(
        'SELECT total, paid FROM invoices WHERE id = ?',
        [invoiceId]
      )

      const updatedInvoice = updatedInvoiceResult[0]
      const remainingBalance = updatedInvoice.total - updatedInvoice.paid

      // insert a new account status with the updated invoice details
      await conn.query(
        `INSERT INTO account_status (
          invoice_id, 
          details, 
          value, 
          pay, 
          remaining, 
          payment_method_id
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          details,
          updatedInvoice.total,
          pay,
          remainingBalance,
          paymentMethod
        ]
      )

      // is alaredy paid,check as 'paid'
      if (updatedInvoice.paid >= updatedInvoice.total) {
        await conn.query(
          `UPDATE invoices 
           SET status = 'paid', 
               paid = total 
           WHERE id = ?`,
          [invoiceId]
        )
      }

      await conn.commit()

      return {
        patientId,
        date: new Date(),
        details,
        value: updatedInvoice.total,
        pay,
        total: remainingBalance,
        paymentMethod
      } as AccountStatus
    } catch (error) {
      await conn.rollback()
      console.error('Error en createAccountStatus:', error)
      throw error
    }
  }

  static async getAccountStatusByPatientId(patientId: any): Promise<any> {
    const conn = await db
    try {
      await conn.beginTransaction()

      const [invoicesResult]: any = await conn.query(
        'SELECT id FROM invoices WHERE patient_id = ? ORDER BY date DESC LIMIT 1',
        [patientId]
      )

      const invoiceId = invoicesResult[0].id

      const [accountStatuses]: any = await conn.query(
        'SELECT * FROM account_status WHERE invoice_id = ? ORDER BY date ASC',
        [invoiceId]
      )
      if (accountStatuses.length === 0) {
        throw new Error('No hay estados de cuenta para este paciente')
      }
      await conn.commit()
      return accountStatuses
    } catch (error) {
      await conn.rollback()
      throw error
    }
  }
}
