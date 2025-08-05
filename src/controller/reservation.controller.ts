import { Request, Response, NextFunction } from "express";
import HTTPError from "../utility/error";
import { slotReservationService } from "../service/reservation.service";
import { IReserveSlot } from "../utility/types/express/slots.type";
const reserveSlot = new slotReservationService();

export const bookSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new HTTPError("Unauthorized", 401);
    }
    const { slotId } = req.body;
    const data: IReserveSlot = {
      slotId,
      email: user.email,
    };
    const bookedSlot = await reserveSlot.bookSlot(data);
    if (!bookedSlot) {
      throw new HTTPError("No slots found", 404);
    }
    return res.status(200).json({
      success: bookedSlot.success,
      message: bookedSlot.message,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookedSlotsOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new HTTPError("Unauthorized", 401);
    }
    const bookedSlots = await reserveSlot.getBookedSlotOfUser(user.email);
    if (!bookedSlots) {
      throw new HTTPError("No booked slots found", 404);
    }
    return res.status(200).json({
      success: true,
      message: "Booked slots retrieved successfully",
      data: bookedSlots,
    });
  } catch (err) {
    next(err);
  }
};

export const delBookedSlotsOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new HTTPError("Unauthorized", 401);
    }
    const { slotId } = req.params;
    const data: IReserveSlot = {
      slotId: typeof slotId === "string" ? parseInt(slotId) : slotId,
      email: user.email,
    };
    const cancelledSlots = await reserveSlot.cancellBookedSlot(data);
    if (!cancelledSlots) {
      throw new HTTPError("No booked slots found", 404);
    }
    return res.status(200).json({
      success: cancelledSlots.success,
      message: cancelledSlots.message,
    });
  } catch (err) {
    next(err);
  }
};
