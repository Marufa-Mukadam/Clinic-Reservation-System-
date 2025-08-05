import express from "express";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/userAuth";
import {
  bookSlots,
  getBookedSlotsOfUser,
} from "../controller/reservation.controller";

dotenv.config();
const route = express.Router();

route.post("/book-slot/:slotId", authenticateUser, bookSlots);

route.get("/get-booked-slots", authenticateUser, getBookedSlotsOfUser);
export default route;
