// Usage: npm run hash-password -- "the password"
// Prints a value for ADMIN_PASSWORD_HASH. The format uses colons, not `$`,
// because Next's .env loader would try to expand `$salt` as a variable.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "a password of 10+ characters"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
