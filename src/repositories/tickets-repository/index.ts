import { prisma } from "@/config";

export interface TicketNovo {
  ticketTypeId: number;
  enrollmentId: number;
  status: "RESERVED";
}

const ticketsRepository = {
  createTicket: async (ticket: TicketNovo) => {
    return prisma.ticket.create({
      data: ticket,
    });
  },

  getTickets: async (enrollmentId: number) => {
    return prisma.ticket.findFirst({
      where: { enrollmentId },
      include: {
        TicketType: true,
      },
    });
  },

  getTicketsByTypes: async () => {
    return prisma.ticketType.findMany();
  },
};

export default ticketsRepository;
