import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import authRoute from "./routes/auth.route";
import drRoute from "./routes/slots.route";
import reservationRoute from "./routes/reservation.route";
import HTTPError from "./utility/error";
import helmet from "helmet";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://marufa-medicare.netlify.app",
];

app.use(
  helmet({
    contentSecurityPolicy: true,
    frameguard: { action: "sameorigin" }, // Prevent clickjacking
    xssFilter: true, // Enable XSS protection
    noSniff: true, // Prevent MIME sniffing
    hsts: {
      // Enforce HTTPS
      maxAge: 16070400,
      includeSubDomains: true,
    },
  })
);

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      console.log("cors error", origin);
      callback(new Error("Not allowed by CORS")); // Block the request
    }
  },
  credentials: true, // Allow cookies & authentication header
  optionsSuccessStatus: 200,
};

app.use(bodyParser.json({ limit: "5mb" }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/auth", authRoute);
app.use("/slots", drRoute);
app.use("/reservation", reservationRoute);
app.use(
  (
    err: { status: number; message: string; stack: any },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof SyntaxError && "body" in err && err.status === 400) {
      // Malformed JSON
      return res.status(400).json({
        success: false,
        message: "Invalid JSON payload",
      });
    }

    if (err.status === 419) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "prod",
        path: "/",
      });
    }
    // Handle CORS errors
    if (err.message === "Not allowed by CORS") {
      return res.status(403).json({
        success: false,
        message: "CORS policy does not allow access from this origin.",
      });
    }

    // For other errors, hide stack traces in production
    const isProd = process.env.NODE_ENV === "prod";
    if (err instanceof HTTPError) {
      return res.status(err.code).json({ error: { message: err.message } });
    } else {
      console.error(err.message); // Log the error for debugging
      return res.status(500).json({
        success: false,
        message: isProd ? "Internal Server Error" : err.message,
        ...(isProd ? {} : { stack: err.stack }), // Include stack trace only in dev
      });
    }
  }
);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
