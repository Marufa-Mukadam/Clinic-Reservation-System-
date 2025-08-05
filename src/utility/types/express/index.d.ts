import "express";

declare global {
  namespace Express {
    interface User {
      email: string;
    }

    interface Request {
      user?: User;
      doctor?: User;
    }
  }
}
