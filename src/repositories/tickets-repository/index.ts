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

  newStatus: async (ticketId: number, status: any) => {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
  },

  getById: async (ticketTypeId: number) => {
    return prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });
  },

  getTicketById: async (ticketId: number) => {
    return prisma.ticket.findUnique({
      where: { id: ticketId },
    });
  },

};

export default ticketsRepository;
