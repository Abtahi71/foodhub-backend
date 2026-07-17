export interface IRequestUser {
  id: string;
  role: Role;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user: IRequestUser;
    }
  }
}
