import bcrypt from "bcryptjs";

export function encodePassword(password, saltRounds = 10) {
  return bcrypt.hashSync(password, saltRounds);
}
