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
      return res.status(httpStatus.BAD_REQUEST).send('Invalid ticketId');
    }

    const ticket = await ticketsRepository.getTickets(ticketIdNumber);
    if (!ticket) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    const enrollment = await enrollmentRepository.enrollmentById(ticket.enrollmentId);
    if (!enrollment) {
      return res.status(httpStatus.NOT_FOUND).send('Enrollment not found');
    }

    if (enrollment.userId != userId) {
      return res.status(httpStatus.UNAUTHORIZED).send('Unauthorized');
    }

    const payment = await paymentsRepository.getPayment(ticketIdNumber);
    if (!payment) {
      return res.status(httpStatus.NOT_FOUND).send('Payment not found');
    }

    res.send(payment);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
  }
}

export async function createPayment(req: Request & { userId: number }, res: Response) {
  try {
    const { userId } = req;
    const { cardData, ticketId } = req.body;

    if (!cardData || !ticketId) {
      return res.status(httpStatus.BAD_REQUEST).send('Missing cardData or ticketId');
    }

    const ticket = await ticketsRepository.getTickets(ticketId);
    if (!ticket) {
      return res.status(httpStatus.NOT_FOUND).send('Ticket not found');
    }

    if (ticket.status === 'PAID') {
      return res.status(httpStatus.UNAUTHORIZED).send('Ticket already paid');
    }

    const enrollment = await enrollmentRepository.enrollmentById(ticket.enrollmentId);
    if (!enrollment) {
      return res.status(httpStatus.NOT_FOUND).send('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      return res.status(httpStatus.UNAUTHORIZED).send('Unauthorized');
    }

    await ticketsRepository.newStatus(ticketId, 'PAID');

    const ticketType = await ticketsRepository.getById(ticket.ticketTypeId);
    const paymentParams: PaymentParams = {
      ticketId,
      cardIssuer: cardData.issuer,
      cardLastDigits: LastDigits(cardData.number.toString()),
      value: ticketType.price,
    };

    const payment = await paymentsRepository.createPayment(paymentParams);
    res.status(httpStatus.OK).send(payment);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
  }
}

function LastDigits(value: string) {
  return value.slice(value.length - 4);
}
