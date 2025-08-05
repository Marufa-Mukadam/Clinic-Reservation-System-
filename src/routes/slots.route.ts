import express from "express";
import dotenv from "dotenv";
import { authenticateAdmin } from "../middleware/adminAuth";
import { createSlot, getSlots } from "../controller/slots.controller";

dotenv.config();
const route = express.Router();

//dr route

route.post("/create-slot", authenticateAdmin, createSlot);
route.get("/get-slot", authenticateAdmin, getSlots);
export default route;
