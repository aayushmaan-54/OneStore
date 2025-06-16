/* eslint-disable @typescript-eslint/no-explicit-any */

export type ServerActionType = {
  status: "success" | "error";
  message?: string;
  error?: string;
  data?: any;
} | null;


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
