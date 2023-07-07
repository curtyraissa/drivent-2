import { Router } from "express";
import { authenticateToken } from "../middlewares";
import { getPayment, createPayment} from '@/controllers';

const paymentsRouter = Router();

paymentsRouter.get('/', authenticateToken, getPayment);
paymentsRouter.post('/process', authenticateToken, createPayment);

export {paymentsRouter};