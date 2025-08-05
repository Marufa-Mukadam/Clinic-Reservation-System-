export interface ISignupDataUser {
  role: "U1";
  email: string;
  pass: string;
  name: string;
}

export type ISignupData = ISignupDataUser | IDrSignupData;

export interface IDrSignupData {
  role: "D2";
  email: string;
  pass: string;
  name: string;
  availability: [
    {
      availableFrom: Date;
      availableTo: Date;
      capacity: number;
    }
  ];
}

export interface ILoginData {
  email: string;
  password: string;
  ip: any;
}

export enum role {
  U1 = "U1",
  D2 = "D2",
}

export const userRole: role = role.U1;
export const DrRole: role = role.U1;

export type IAvailability = {
  availableFrom: Date;
  availableTo: Date;
  capacity: number;
}[];

export type ExpiresIn = `${number}${"s" | "m" | "h" | "d" | "y"}` | number;