// src/auth/types.ts
import { Request as ExpressRequest } from "express";
import { User } from "../users/users.entity";

export interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: Partial<User>;
}
