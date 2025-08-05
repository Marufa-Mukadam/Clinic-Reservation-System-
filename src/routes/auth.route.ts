import express from "express";
import dotenv from "dotenv";

import { authenticateUser } from "../middleware/userAuth";
import {
  drActivateAccount,
  drLoginPassword,
  drlogout,
  drRefreshToken,
  refreshToken,
  registerDr,
  registerUser,
  userActivateAccount,
  userLoginPassword,
  Userlogout,
} from "../controller/auth.controller";
import { authenticateAdmin } from "../middleware/adminAuth";

dotenv.config();
const route = express.Router();

//user route
route.post("/signup", registerUser);
route.post("/activate-account", userActivateAccount);
route.post("/login-password", userLoginPassword);
route.post("/refresh-token", refreshToken);
route.post("/logout", authenticateUser, Userlogout);

//dr route
route.post("/dr-signup", registerDr);
route.post("/dr-activate-account", drActivateAccount);
route.post("/dr-login-password", drLoginPassword);
route.post("/dr-refresh-token", drRefreshToken);
route.post("/dr-logout", authenticateAdmin, drlogout);

export default route;
