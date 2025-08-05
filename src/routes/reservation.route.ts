import express from "express";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/userAuth";
import {
  bookSlots,
  delBookedSlotsOfUser,
  getBookedSlotsOfUser,
} from "../controller/reservation.controller";

dotenv.config();
const route = express.Router();

route.post("/book-slot", authenticateUser, bookSlots);

route.get("/get-booked-slots", authenticateUser, getBookedSlotsOfUser);

route.delete(
  "/delete-booked-slots/:slotId",
  authenticateUser,
  delBookedSlotsOfUser
);
export default route;
