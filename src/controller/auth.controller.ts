import { Request, Response, NextFunction } from "express";
import {
  ILoginData,
  ISignupData,
  role,
} from "../utility/types/express/auth.type";
import HTTPError from "../utility/error";
import { adminAuthService } from "../service/auth.service";
import { Helpers } from "../utility/helperValidation";
import {
  VLogin,
  VRegistration,
  VRegistrationDr,
} from "../utility/validations/auth.validation";
import { PasswordHash } from "../utility/passwordHash";
const authenticate = new adminAuthService();

//doctor controllers
export const registerDr = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, pass, availability } = req.body;
    Helpers.validateWithZod(VRegistrationDr, {
      name,
      email,
      pass,
      availability,
    });

    const hashedPassword = await PasswordHash.bcryptPassword(pass);
    const data: ISignupData = {
      role: "D2",
      name,
      email,
      pass: hashedPassword,
      availability,
    };
    await authenticate.register(data);

    return res.status(200).json({
      message: "Email has been sent successfully , kindly activate ur account.",
      success: true,
      // data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const drActivateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new HTTPError("Unauthorized ", 401);
    }
    const userCreated = await authenticate.drActivateAccount(token);

    return res.status(200).json({
      message: userCreated.message,
      success: userCreated.success,
    });
  } catch (error) {
    next(error);
  }
};

export const drLoginPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const role = "D2";
    const data: ILoginData = {
      email,
      password,
    };
    Helpers.validateWithZod(VLogin, data);
    const userCreated = await authenticate.login(data, role);

    res.cookie("refreshToken", userCreated.refreshToken, {
      httpOnly: true,
      sameSite: "strict", // or 'Strict'
      secure: false,
      path: "/",
    });
    return res.status(200).json({
      message: "Doctor logged in successfully",
      success: true,
      accessToken: userCreated.token,
    });
  } catch (error) {
    next(error);
  }
};

//user controllers
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, pass, name } = req.body;
    const hashedPassword = await PasswordHash.bcryptPassword(pass);
    Helpers.validateWithZod(VRegistration, { email, pass, name });

    const data: ISignupData = {
      role: "U1",
      name,
      email,
      pass: hashedPassword,
    };
    await authenticate.register(data);

    return res.status(200).json({
      message: "Email has been sent successfully , kindly activate ur account.",
      success: true,
      // data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const userActivateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new HTTPError("Unauthorized", 401);
    }
    const userCreated = await authenticate.userActivateAccount(token);

    // const { password, refreshToken, ...user } = userCreated; // Exclude password and refreshToken from the response
    return res.status(200).json({
      message: userCreated.message,
      success: userCreated.success,
      // data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const userLoginPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const role = "U1";

    const data: ILoginData = {
      email,
      password,
      // Assuming you want to include the IP address
    };
    Helpers.validateWithZod(VLogin, data);

    const userCreated = await authenticate.login(data, role);

    res.cookie("refreshToken", userCreated.refreshToken, {
      httpOnly: true,
      sameSite: "strict", // or 'Strict'
      secure: false,
      path: "/",
    });
    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      accessToken: userCreated.token,
    });
  } catch (error) {
    next(error);
  }
};

export const Userlogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new HTTPError("Unauthorized", 401);
    }
    const userRole: role = role.U1;
    const logoutResponse = await authenticate.logout(user, userRole);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // if using HTTPS
      sameSite: "strict", // or 'Lax' / 'None' based on your setup
      path: "/",
    });

    return res.status(200).json({
      success: logoutResponse.success,
      message: logoutResponse.message,
    });
  } catch (err) {
    next(err);
  }
};

export const drlogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.doctor;
    if (!user) {
      throw new HTTPError("Unauthorized", 401);
    }
    const doctorRole: role = role.D2;
    const logoutResponse = await authenticate.logout(user, doctorRole);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // if using HTTPS
      sameSite: "strict", // or 'Lax' / 'None' based on your setup
      path: "/",
    });

    return res.status(200).json({
      success: logoutResponse.success,
      message: logoutResponse.message,
    });
  } catch (err) {
    next(err);
  }
};

//common
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.cookies?.refreshToken) {
      throw new HTTPError("No refresh token provided", 401);
    }

    //verify the access token
    const bearerToken = req.headers.authorization?.split(" ")[1];
    if (!bearerToken) {
      throw new HTTPError("No access token provided", 401);
    }

    const userRole: role = role.U1;

    const generatedRefreshToken = await authenticate.generateRefreshToken(
      bearerToken,
      req.cookies.refreshToken,
      userRole
    );

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      accessToken: generatedRefreshToken.newToken,
    });
  } catch (error) {
    next(error);
  }
};

export const drRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.cookies?.refreshToken) {
      throw new HTTPError("No refresh token provided", 401);
    }
    //verify the access token
    const bearerToken = req.headers.authorization?.split(" ")[1];
    if (!bearerToken) {
      throw new HTTPError("No access token provided", 401);
    }
    const drRole: role = role.D2;
    const generatedRefreshToken = await authenticate.generateRefreshToken(
      bearerToken,
      req.cookies.refreshToken,
      drRole
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken: generatedRefreshToken.newToken,
    });
  } catch (error) {
    next(error);
  }
};
