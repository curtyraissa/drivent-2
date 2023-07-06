import { AuthenticatedRequest } from "@/middlewares";
import { Response, Request } from "express";
import ticketsService from "../services/tickets-service/index";
import httpStatus from "http-status";

export async function createTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId } = req.body;

  if (!ticketTypeId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const result = await ticketsService.createTicket(userId, ticketTypeId);
    return res.status(httpStatus.CREATED).send(result);
  } catch (error) {
    if (error.name == 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name == 'RequestError') {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const result = await ticketsService.getTickets(userId);
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name == 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function getTicketsTypes(req: Request, res: Response) {
  try {
    const result = await ticketsService.getTicketsByType();
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  }
}
