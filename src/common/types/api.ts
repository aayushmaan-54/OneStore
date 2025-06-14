export type ServerActionType = {
  status: "success" | "error";
  message?: string;
  error?: string;
} | null;


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
