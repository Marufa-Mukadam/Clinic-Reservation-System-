import prisma from "../prisma";
import { JwtPayload } from "jsonwebtoken";
import {
  ILoginData,
  ISignupData,
  role,
} from "../utility/types/express/auth.type";
import HTTPError from "../utility/error";
import bcrypt from "bcrypt";

import { tokenExpiryTime } from "../constants/data";
import { mailService } from "../utility/emailServices";
import { ISlots } from "../utility/types/express/slots.type";
import { SlotValidator } from "../utility/checkappointmentOverlapping";
import { TokenManagement } from "../utility/token";

export class adminAuthService {
  drActivateAccount = async (token: string) => {
    const decodedToken = TokenManagement.verifyToken(
      token,
      true,
      process.env.JWT_ACC_ACTIVATE!
    );
    if (!decodedToken) {
      throw new HTTPError("Invalid token", 400);
    }
    const { email, name, pass, availability } = decodedToken;

    const user = await prisma.doctor.create({
      data: {
        email: email,
        password: pass,
        name: name,
        timeSlots: {
          createMany: {
            data: availability.map((time: ISlots) => ({
              availableFrom: time.availableFrom,
              availableTo: time.availableTo,
              capacity: time.capacity,
            })),
          },
        },
      },
    });
    if (!user) {
      throw new HTTPError("Failed to create user", 500);
    }

    return {
      success: true,
      message: "Account created successfully",
    };
  };

  userActivateAccount = async (token: string) => {
    const decodedToken = TokenManagement.verifyToken(
      token,
      true,
      process.env.JWT_ACC_ACTIVATE!
    );
    if (!decodedToken) {
      throw new HTTPError("Invalid token", 400);
    }
    const { email, name, pass } = decodedToken;

    // Logic to create a user in the database
    const user = await prisma.user.create({
      data: {
        email: email,
        password: pass,
        name: name,
      },
    });
    if (!user) {
      throw new HTTPError("Failed to create user", 500);
    }

    return {
      success: true,
      message: "Account created successfully",
    };
  };

  //Send a verification link to the provided email address to confirm its validity and existence.
  register = async (data: ISignupData) => {
    const { email, name, pass, role } = data;
    let availability = null;
    if (data.role === "D2") {
      // Use provided capacity or default to 0
      availability = data.availability;

      await SlotValidator.isSlotOverlappingDuringRegistration(availability); //check if any slot is overlapping with other , sorted the slots is ascending and then checked
    }

    //dynamically get the model key from environment variable and check if the user already exists
    const modelKey = process.env[role] as keyof typeof prisma;
    const existingUser = await (prisma[modelKey] as any).findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      throw new HTTPError("User already exists", 400);
    }

    const tokenData =
      role === "U1"
        ? { email, name, pass }
        : { email, name, pass, availability };
    const token = await TokenManagement.generateToken(
      tokenData,
      process.env.JWT_ACC_ACTIVATE!,
      "10m" // expiry time of link
    );

    const dynamicRoute =
      role === "U1"
        ? "authenticate/activateUser"
        : "authenticate/activateDoctor";

    // Send the activation email
    mailService(email, "Account activation", token, `${dynamicRoute}`);

    return {
      success: true,
      message: "Account created successfully",
    };
  };

  login = async (data: ILoginData, role: string) => {
    const { email, password } = data;
    const modelType = process.env[role] as keyof typeof prisma;
    const user = await (prisma[modelType] as any).findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HTTPError("User not found", 404);
    }
    // Logic to verify password
    if (!user.password) {
      throw new HTTPError(
        "You are signed up using google account please use one",
        400
      );
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HTTPError("Invalid password", 401);
    }

    const token = await TokenManagement.generateToken(
      { email: user.email, ip: data.ip },
      process.env.JWT_TOKEN_SECRET!,
      tokenExpiryTime.accessTokenTime
    );

    const refreshToken = await TokenManagement.generateToken(
      { email: user.email },
      process.env.JWT_REFRESH_SECRET!,
      tokenExpiryTime.refreshTokenTime
    );

    await (prisma[modelType] as any).update({
      where: { id: user.id },
      data: { refreshToken: refreshToken }, // Store the refresh token in the database
    });

    return {
      token,
      refreshToken,
    };
  };

  logout = async (user: { email: string }, role: role) => {
    const modelKey = process.env[role] as keyof typeof prisma;
    const findUser = await (prisma[modelKey] as any).findUnique({
      where: {
        email: user.email,
      },
    });
    if (!findUser) {
      throw new HTTPError("User not found", 404);
    }

    await await (prisma[modelKey] as any).update({
      where: {
        email: user.email,
      },
      data: {
        refreshToken: null,
      },
    });

    return {
      message: "User logged out successfully",
      success: true,
    };
  };

  generateRefreshToken = async (
    bearerToken: string,

    refreshToken: string,
    role: role
  ) => {
    let token: JwtPayload | string | null | undefined = null;
    token = TokenManagement.verifyToken(
      bearerToken,
      false,
      process.env.JWT_TOKEN_SECRET!
    );

    if (token) {
      return { newToken: bearerToken }; // Return the existing token
    }

    const refreshTokenDecoded =
      TokenManagement.verifyRefreshToken(refreshToken);

    const modelKey = process.env[role] as keyof typeof prisma;
    const findUser = await (prisma[modelKey] as any).findUnique({
      where: { email: refreshTokenDecoded.email },
    });
    if (!findUser) {
      throw new HTTPError("User not found", 404);
    }

    //check if the user has a refresh token
    if (!findUser.refreshToken) {
      throw new HTTPError("User not logged in ", 400);
    }

    //verify the refresh token
    if (findUser.refreshToken !== refreshToken) {
      throw new HTTPError(
        "Invalid refresh token (refresh token not same)",
        401
      );
    }
    token = await TokenManagement.generateToken(
      { email: findUser.email },
      process.env.JWT_TOKEN_SECRET!,
      tokenExpiryTime.accessTokenTime
    );

    return {
      newToken: token, // Return the new token
    };
  };
}
