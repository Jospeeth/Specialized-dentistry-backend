import { Request, Response } from 'express'
import { BillingModel } from '../models/billingModel'
import { Invoices, TreatmentBudget } from '../utils/schemas'

export class BillingController {
  static async createInvoiceAndBudget(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const {
        patientId,
        paid,
        treatmentBudget
      }: {
        patientId: string
        paid: number
        treatmentBudget: TreatmentBudget[]
      } = req.body

      if (
        !patientId ||
        !treatmentBudget ||
        !Array.isArray(treatmentBudget) ||
        treatmentBudget.length === 0
      ) {
        res.status(400).json({
          success: false,
          message: 'Patient ID and treatment budget list are required'
        })
        return
      }

      const total = treatmentBudget.reduce((sum, item) => sum + item.value, 0)

      const invoice: Invoices = {
        patientId: patientId,
        total,
        paid
      }

      const result = await BillingModel.createInvoiceAndBudget(
        invoice,
        treatmentBudget
      )

      res.status(201).json({
        success: true,
        data: result,
        message: 'Invoice and treatment budget created successfully'
      })
    } catch (error) {
      console.error('Error creating invoice and treatment budget:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create invoice and treatment budget'
      })
    }
  }

  static async createAccountStatus(req: Request, res: Response): Promise<void> {
    const accountStatus = req.body
    const { patientId } = accountStatus

    try {
      // Crear el nuevo abono
      const resultAccountStatus =
        await BillingModel.createAccountStatus(accountStatus)

      res.status(201).json({
        success: true,
        data: resultAccountStatus,
        message: 'Account status created and history fetched successfully'
      })
    } catch (error) {
      console.error('Error creating account status:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create account status'
      })
    }
  }
}
