import {
  argon2,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const ARGON2_CONFIG = {
  parallelism: 1,
  tagLength: 32,
  memory: 19456,
  passes: 2,
};

function derivePasswordHash(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    argon2(
      "argon2id",
      {
        message: password,
        nonce: salt,
        ...ARGON2_CONFIG,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);

  const hash = await derivePasswordHash(password, salt);

  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedPasswordHash: string,
) {
  const [saltHex, hashHex] = storedPasswordHash.split(":");

  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const storedHash = Buffer.from(hashHex, "hex");

  const candidateHash = await derivePasswordHash(password, salt);

  if (candidateHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(candidateHash, storedHash);
}