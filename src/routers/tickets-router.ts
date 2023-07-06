import { getTickets, getTicketsTypes, createTickets } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const ticketsRouter = Router();

ticketsRouter.get('/types', authenticateToken, getTicketsTypes);
ticketsRouter.get('/', authenticateToken, getTickets);
ticketsRouter.post('/', authenticateToken, createTickets);

export { ticketsRouter };