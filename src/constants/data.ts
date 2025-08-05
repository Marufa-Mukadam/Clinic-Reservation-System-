import jwt from "jsonwebtoken";

export const tokenExpiryTime: {
  accessTokenTime: jwt.SignOptions["expiresIn"];
  refreshTokenTime: jwt.SignOptions["expiresIn"];
} = {
  accessTokenTime: "5m",
  refreshTokenTime: "7d",
};
Object.freeze(tokenExpiryTime);

export const emailHost = "smtpout.secureserver.net";
export const emailPort = 587;
export const emailSecure = true;
export const emailService: string = "gmail";

export const saltRounds = 12;

