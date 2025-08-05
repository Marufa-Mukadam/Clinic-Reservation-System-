import { Request, Response, NextFunction } from "express";
import HTTPError from "../utility/error";
import prisma from "../prisma";
import { TokenManagement } from "../utility/token";

export const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  //verify the access token
  const bearerToken = req.headers.authorization?.split(" ")[1];
  if (!bearerToken) {
    throw new HTTPError("No access token provided", 401);
  }
  const token = TokenManagement.verifyToken(
    bearerToken,

    true,
    process.env.JWT_TOKEN_SECRET!
  );
  //check if the user exists in the database
  const user = await prisma.user.findUnique({
    where: { email: token && token.email! },
  });
  if (!user) {
    throw new HTTPError("User not found", 404);
  }

  //check if the user has a refresh token
  if (!user.refreshToken) {
    throw new HTTPError("User not logged in", 400);
  }
  //verify the refresh token
  TokenManagement.verifyRefreshToken(user.refreshToken);
  req.user = {
    email: user.email,
  };

  next();
};
