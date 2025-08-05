import prisma from "../prisma";
import { ICreateSlot } from "../utility/types/express/slots.type";
import HTTPError from "../utility/error";
import { SlotValidator } from "../utility/checkappointmentOverlapping";

export class slotsService {
  createSlot = async (data: ICreateSlot) => {
    const { capacity, availableFrom, availableTo, email } = data;
    const doctor = await prisma.doctor.findUnique({ where: { email } });
    if (!doctor) {
      throw new HTTPError("Doctor not found", 404);
    }
    const isSlotOverlap = await SlotValidator.hasOverlappingSlotInDB(
      availableFrom,
      availableTo,
      email
    );
    if (isSlotOverlap) {
      throw new HTTPError("Slot overlapped", 601);
    }
    const slot = await prisma.timeSlots.create({
      data: {
        availableFrom: availableFrom,
        availableTo: availableTo,
        doctorId: doctor.id,
        capacity,
      },
    });
    if (!slot) {
      throw new HTTPError("Failed to create slot", 500);
    }
    return {
      success: true,
      message: "Slot created successfully",
    };
  };

  getSlots = async (email: string) => {
    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });
    if (!doctor) {
      throw new HTTPError("Doctor not found", 404);
    }
    const timeSlots = await prisma.timeSlots.findMany({
      where: {
        doctorId: doctor.id,
      },
      orderBy: {
        availableFrom: "asc",
      },
    });
    return {
      success: true,
      message: "Slot fetched successfully",
      data: timeSlots,
    };
  };
}
