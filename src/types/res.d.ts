import type { Tables } from "./db.js";

type Locals = {
  user: Tables["User"];
};

type BodyData = Record<string, any>;

type BodySuccess = {
  success: true;
  data?: BodyData | BodyData[];
};

type BodyFail = {
  success: false;
  message: string;
};

export type TResponse = {
  Body: { Fail: BodyFail; Success: BodySuccess };
  Locals: Partial<Locals>;
};
