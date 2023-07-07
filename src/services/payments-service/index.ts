import { Response } from 'express';
import httpStatus from 'http-status';
import paymentsRepository, { PaymentParams } from '@/repositories/payments-repository';
import { notFoundError, unauthorizedError, requestError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository, { TicketNovo } from '@/repositories/tickets-repository';
import { AuthenticatedRequest } from '../../middlewares';

const paymentService = {
  async getPayment(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { ticketId } = req.query;
    const ticketIdNumber = Number(ticketId);

    if (isNaN(ticketIdNumber)) {
      throw requestError(httpStatus.BAD_REQUEST, 'Invalid ticketId');
    }

    const ticket = await ticketsRepository.getTickets(ticketIdNumber);
    if (!ticket) {
      throw notFoundError();
    }

    const enrollment = await enrollmentRepository.enrollmentById(ticket.enrollmentId);
    if (!enrollment) {
      throw notFoundError();
    }

    if (enrollment.userId !== userId) {
      throw unauthorizedError();
    }

    const payment = await paymentsRepository.getPayment(ticketIdNumber);
    if (!payment) {
      throw notFoundError();
    }

    res.send(payment);
  },

  async createPayment(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { cardData, ticketId } = req.body;

    if (!cardData || !ticketId) {
      throw requestError(httpStatus.BAD_REQUEST, 'Missing cardData or ticketId');
    }

    const ticket = await ticketsRepository.getTickets(ticketId);
    if (!ticket) {
      throw notFoundError();
    }

    if (ticket.status === 'PAID') {
      throw unauthorizedError();
    }

    const enrollment = await enrollmentRepository.enrollmentById(ticket.enrollmentId);
    if (enrollment.userId !== userId) {
      throw unauthorizedError();
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
  },
};

function LastDigits(value: string) {
  return value.slice(value.length - 4);
}

export default paymentService;
