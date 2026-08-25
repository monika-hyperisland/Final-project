import { SignJWT, jwtVerify } from "jose";

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return new TextEncoder().encode(jwtSecret);
}

export async function createAuthToken(userId: string) {
  const secret = getJwtSecret();

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token: string) {
  const secret = getJwtSecret();

  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  if (!payload.sub) {
    throw new Error("Token does not contain a user ID");
  }

  return payload.sub;
}


