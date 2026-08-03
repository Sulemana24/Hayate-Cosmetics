export const allowedAdmins = [
  "iddrisusulemana665@gmail.com",
  "iddrisusulemana1996@gmail.com",
  "yussifhayate10@icloud.com",
];

export function isAllowedAdmin(email: string): boolean {
  return allowedAdmins.includes(email.toLowerCase().trim());
}
