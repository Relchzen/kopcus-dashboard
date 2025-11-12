export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "STAFF";
  createdAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "USER" | "STAFF";
}
