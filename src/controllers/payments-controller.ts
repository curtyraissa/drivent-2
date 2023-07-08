import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import paymentsRepository, { PaymentParams } from '@/repositories/payments-repository';
import { AuthenticatedRequest } from '../middlewares';

export async function getPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { ticketId } = req.query;
    const ticketIdNumber = Number(ticketId);

    if (isNaN(ticketIdNumber)) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const ticket = await ticketsRepository.getTicketById(ticketIdNumber);
    if (!ticket) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    const enrollment = await enrollmentRepository.enrollmentById(ticket.enrollmentId);
    if (!enrollment) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (enrollment.userId != userId) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    const payment = await paymentsRepository.getPayment(ticketIdNumber);
    if (!payment) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    res.send(payment);
  } catch (error) {
    console.error(error);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function createPayment(req: Request & { userId: number }, res: Response) {
  try {
    const { userId } = req;
    const { cardData, ticketId } = req.body;

    if (!cardData || !ticketId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const ticket = await ticketsRepository.getTicketById(ticketId);
    if (!ticket) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (ticket.status === 'PAID') {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    const enrollment = await enrollmentRepository.enrollmentById(ticket.enrollmentId);
    if (!enrollment) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (enrollment.userId !== userId) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    await ticketsRepository.newStatus(ticketId, 'PAID');

    const ticketType = await ticketsRepository.getById(ticket.ticketTypeId);
    const paymentParams: PaymentParams = {
      ticketId,
      cardIssuer: cardData.issuer,
      cardLastDigits: cardData.number.slice(-4),
      value: ticketType.price,
    };

    const payment = await paymentsRepository.createPayment(paymentParams);
    res.status(httpStatus.OK).send(payment);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
  }
}