// utils/SlotValidator.ts
import prisma from "../prisma";
import HTTPError from "./error";
import { IAvailability } from "./types/express/auth.type";

export class SlotValidator {
  static async hasOverlappingSlotInDB(from: Date, to: Date, email: string) {
    const appointment = await prisma.doctor.findFirst({
      where: {
        email,
        timeSlots: {
          some: {
            AND: [{ availableFrom: { lt: to } }, { availableTo: { gt: from } }],
          },
        },
      },
    });

    return !!appointment;
  }

  static async isSlotOverlappingDuringRegistration(
    availability: IAvailability
  ) {
    const sortedSlots = availability
      .map((slot) => ({
        start: new Date(slot.availableFrom),
        end: new Date(slot.availableTo),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];

      if (current.end > next.start) {
        throw new HTTPError(
          `Time slots overlapped: ` +
            `[${current.start.toISOString()} - ${current.end.toISOString()}] and ` +
            `[${next.start.toISOString()} - ${next.end.toISOString()}]`,
          409
        );
      }
    }
  }
}
