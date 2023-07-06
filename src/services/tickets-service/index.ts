import { TicketStatus } from "@prisma/client";
import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/tickets-repository";

const ticketsService = {
  async createTicket(userId: number, ticketTypeId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    await ticketsRepository.createTicket({
      ticketTypeId: ticketTypeId,
      enrollmentId: enrollment.id,
      status: TicketStatus.RESERVED,
    });

    const result = await ticketsRepository.getTickets(enrollment.id);

    return result;
  },

  async getTickets(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const result = await ticketsRepository.getTickets(enrollment.id);
    if (!result) throw notFoundError();

    return result;
  },

  async getTicketsByType() {
    const resultTypes = await ticketsRepository.getTicketsByTypes();
    if (!resultTypes) throw notFoundError();

    return resultTypes;
  }
  
};

export default ticketsService;
