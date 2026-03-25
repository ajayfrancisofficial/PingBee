export type LoginType = 'phoneLogin' | 'emailLogin' | 'googleLogin';

export interface PhoneLoginRequest {
  type: 'phoneLogin';
  phoneNumber: string;
  code: string;
}

export interface EmailLoginRequest {
  type: 'emailLogin';
  email: string;
  password: string;
  code?: string;
}

export interface GoogleLoginRequest {
  type: 'googleLogin';
  idToken: string;
}

export type LoginRequest =
  | PhoneLoginRequest
  | EmailLoginRequest
  | GoogleLoginRequest;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phoneNumber?: string;
    email?: string;
  };
}
