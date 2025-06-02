export interface JwtPayload {
  username: string;
  sub: string;
  role: 'Admin' | 'VA';
}