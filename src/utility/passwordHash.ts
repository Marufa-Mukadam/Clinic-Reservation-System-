import bcrypt from "bcrypt";
import { saltRounds } from "../constants/data";

export class PasswordHash {
  static async bcryptPassword(password: string) {
    // You can adjust the salt rounds as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
}
