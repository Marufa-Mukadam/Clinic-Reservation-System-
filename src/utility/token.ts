import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import HTTPError from "./error";

export class TokenManagement {
  static verifyToken(
    bearerToken: string,
    toCheckTokenExpiry: boolean,
    secret: string
  ) {
    const decodedData = jwt.verify(bearerToken, secret, {
      ignoreExpiration: true,
    }) as JwtPayload;
    if (!decodedData.exp || !decodedData.email) {
      throw new HTTPError("Invalid token: no expiry or emailid", 401);
    }

    //for refresh token, we dont check expiry
    //check if the token is expired
    if (decodedData.exp <= Date.now() / 1000 && toCheckTokenExpiry) {
      throw new HTTPError("Access token expired", 401);
    }

    if (decodedData.exp >= Date.now() / 1000) {
      return decodedData;
    }
  }

  static verifyRefreshToken(refreshToken: string) {
    const decodedData = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
      { ignoreExpiration: true }
    ) as JwtPayload;
    if (!decodedData || !decodedData.exp) {
      throw new HTTPError("Invalid refresh token", 401);
    }
    if (decodedData.exp <= Date.now() / 1000) {
      throw new HTTPError("Session expired please login again", 419);
    }
    return decodedData;
  }

  static async generateToken(
    data: Record<string, any>,
    secret: Secret,
    expiresIn: jwt.SignOptions["expiresIn"]
  ) {
    const options: SignOptions = { expiresIn }; // ✅ ensure correct type

    return jwt.sign(data, secret, options);
  }
}
