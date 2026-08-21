declare module "express-session" {
  interface SessionData {
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }
}

export {};
