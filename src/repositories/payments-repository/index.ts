import { PrismaClient, Payment } from '@prisma/client';
import { TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

export type PaymentParams = Pick<Payment, 'ticketId' | 'value' | 'cardIssuer' | 'cardLastDigits'>;

const paymentsRepository = {
  createPayment: async (params: PaymentParams) => {
    const { ticketId, value, cardIssuer, cardLastDigits } = params;
    return prisma.payment.create({
      data: {
        ticketId,
        value,
        cardIssuer,
        cardLastDigits,
      },
    });
  },
  
  getPayment: async (ticketId: number) => {
    return prisma.payment.findFirst({
      where: {
        ticketId,
      },
    });
  },
};

export async function getTicketPrice(ticketId: number): Promise<number | null> {
  const ticketType = await prisma.ticketType.findUnique({
    where: {
      id: ticketId,
    },
  });

  return ticketType?.price || null;
}

export async function markTicketsAsPaid(userId: number) {
  const prisma = new PrismaClient();
  return prisma.ticket.updateMany({
    where: {
      Enrollment: {
        userId,
      },
    },
    data: {
      status: TicketStatus.PAID,
    },
  });
}

export async function getTicketUserId(ticketId: number): Promise<number> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      Enrollment: true,
    },
  });

  return ticket?.Enrollment.userId;
}

export default paymentsRepository;
