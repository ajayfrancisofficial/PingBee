// Register Types
export interface RegisterRequest {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  //modify this
  //not implemented in backend
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Login Types
export interface LoginRequest {
  identifier: string;
  password: string;
}
export interface LoginResponse {
  //modify this
  // not implemented in backend
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phoneNumber?: string;
    email?: string;
    username?: string;
  };
}
