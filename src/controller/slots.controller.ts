import { Request, Response, NextFunction } from "express";
import HTTPError from "../utility/error";
import { slotsService } from "../service/slots.service";
import { ICreateSlot } from "../utility/types/express/slots.type";
import { Helpers } from "../utility/helperValidation";
import { VCreateSlot } from "../utility/validations/slot.validation";

const slot = new slotsService();
export const createSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dr = req.doctor;
    if (!dr) {
      throw new HTTPError("Unauthorized", 401);
    }
    const { availableFrom, availableTo, capacity } = req.body;
    const from = new Date(availableFrom);
    const to = new Date(availableTo);
    
    Helpers.validateWithZod(VCreateSlot, {
      availableFrom,
      availableTo,
      capacity,
    });

    const data: ICreateSlot = {
      availableFrom: from,
      availableTo: to,
      capacity,
      email: dr.email,
    };
    const updatedSlot = await slot.createSlot(data);
    if (!updatedSlot) {
      throw new HTTPError("User creation failed", 500);
    }
    return res.status(200).json({
      message: "Slot created successfully.",
      success: true,
      // data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dr = req.doctor;
    if (!dr) {
      throw new HTTPError("Unauthorized", 401);
    }
    const slots = await slot.getSlots(dr.email);
    if (!slots) {
      throw new HTTPError("No slots found", 404);
    }
    return res.status(200).json({
      message: "Slots fetched successfully.",
      success: true,
      data: slots,
    });
  } catch (err) {
    next(err);
  }
};
