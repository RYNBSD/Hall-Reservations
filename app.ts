import type { NextFunction, Request, Response } from "express";
import type { TResponse } from "./src/types/index.js";
import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";
import { router } from "./src/router/index.js";

const app = express();
app.disable("x-powered-by");
app.enable("json escape");
app.enable("etag");

app.use(cors());
app.use(helmet());
app.use(morgan(IS_PRODUCTION ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      maxAge: 1000 * 60 * 15, // 15 minutes
      secure: IS_PRODUCTION,
      sameSite: IS_PRODUCTION,
      httpOnly: IS_PRODUCTION,
    },
  })
);

app.use("/", router);
app.use(express.static(path.join(__root, "public"), { etag: true }));

app.all("*", async (_req: Request, res: Response<TResponse["Body"]["Fail"]>) =>
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Not found",
  })
);
app.use(
  async (
    error: unknown,
    _req: Request,
    res: Response<TResponse["Body"]["Fail"]>,
    _next: NextFunction
  ) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error instanceof Error ? error.message : `${error}`,
    });
  }
);

export default app;
