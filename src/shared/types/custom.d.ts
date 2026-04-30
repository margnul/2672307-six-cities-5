declare namespace Express {
  export interface Request {
    tokenPayload?: {
      id: string;
      email: string;
    };
  }
}
