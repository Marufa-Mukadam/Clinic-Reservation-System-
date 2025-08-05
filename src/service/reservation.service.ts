import prisma from "../prisma";
import { IReserveSlot } from "../utility/types/express/slots.type";
import HTTPError from "../utility/error";

export class slotReservationService {
  bookSlot = async (data: IReserveSlot) => {
    const { slotId, email } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HTTPError("User not found", 404);
    }

    //maintaining transaction to ensure atomicity and locking the slot
    const result = await prisma.$transaction(async (tx) => {
      // Lock slot
      const [lockedSlot] = await tx.$queryRawUnsafe<
        {
          id: number;
          capacity: number;
          doctorId: number;
          availableFrom: Date;
        }[]
      >(`SELECT * FROM "TimeSlots" WHERE "id" = $1 FOR UPDATE`, slotId);

      if (!lockedSlot) throw new HTTPError("Slot not found", 404);

      //check if the slot exists and has capacity
      if (lockedSlot.capacity <= 0)
        throw new HTTPError("Slot has no remaining capacity", 400);

      const existingReservation = await tx.reservation.findFirst({
        where: {
          userId: user.id,
          timeSlot: {
            doctorId: lockedSlot.doctorId,
            availableFrom: {
              gte: new Date(
                new Date(lockedSlot.availableFrom).setHours(0, 0, 0, 0)
              ),
              lte: new Date(
                new Date(lockedSlot.availableFrom).setHours(23, 59, 59, 999)
              ),
            },
          },
        },
      });

      if (existingReservation) {
        throw new HTTPError(
          "You have already booked a slot for this doctor on the same date",
          400
        );
      }

      const reservation = await tx.reservation.create({
        data: {
          userId: user.id,
          slotId: slotId,
        },
      });

      const updatedSlot = await tx.timeSlots.update({
        where: { id: slotId },
        data: {
          capacity: {
            decrement: 1,
          },
        },
      });

      return { lockedSlot, reservation, updatedSlot };
    });

    return {
      success: true,
      message: "Slot booked successfully",
      data: result.lockedSlot,
    };
  };

  getBookedSlotOfUser = async (email: string) => {
    const now = new Date();
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HTTPError("Doctor not found", 404);
    }
    const upcomingAppointments = await prisma.timeSlots.findMany({
      where: {
        availableFrom: {
          gt: now,
        },
        reservations: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        availableFrom: true,
        availableTo: true,
        doctor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        availableFrom: "asc",
      },
    });

    const pastAppointments = await prisma.timeSlots.findMany({
      where: {
        availableFrom: {
          lt: now,
        },
        reservations: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        availableFrom: true,
        availableTo: true,
        doctor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        availableFrom: "asc",
      },
    });

    return {
      success: true,
      message: "Slot created successfully",
      upcomingAppointments,
      pastAppointments,
    };
  };
}
