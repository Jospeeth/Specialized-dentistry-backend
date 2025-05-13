import { Router } from 'express'
import { BillingController } from '../controllers/billingController'

export const billingRoutes = Router()


billingRoutes.post('/invoice', BillingController.createInvoiceAndBudget)
billingRoutes.post('/account-status', BillingController.createAccountStatus)

