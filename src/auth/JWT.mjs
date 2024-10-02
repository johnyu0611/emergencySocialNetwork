import { AuthPayloadSchema } from "@/auth/schema/AuthPayload.mjs";
import { config } from "@/config/Config.mjs";
import jwt from "jsonwebtoken";

export class JWT {
  constructor() {
    this.preSharedKey = config.environment.jwtPreSharedKey;
    this.signOptions = config.security.jwt.signOptions;
    this.verifyOptions = config.security.jwt.verifyOptions;
  }

  encode(payload) {
    const parsedAuthPayload = AuthPayloadSchema.parse(payload);
    return jwt.sign(parsedAuthPayload, this.preSharedKey, this.signOptions);
  }

  decode(token) {
    const authPayload = jwt.verify(
      token,
      this.preSharedKey,
      this.verifyOptions
    );
    return AuthPayloadSchema.parse(authPayload);
  }
}
