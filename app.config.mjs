const jwtIssuer = "FSE Team SB-1";

export const staticConfig = {
  server: {
    port: 3000,
    staticFolder: "public",
    apiBasePath: "/api"
  },
  security: {
    jwt: {
      signOptions: {
        algorithm: "HS512",
        expiresIn: "1h",
        issuer: jwtIssuer,
        allowInsecureKeySizes: false,
        allowInvalidAsymmetricKeyTypes: false
      },
      verifyOptions: {
        algorithms: ["HS512"],
        complete: false,
        issuer: jwtIssuer,
        ignoreExpiration: false,
        ignoreNotBefore: false,
        allowInvalidAsymmetricKeyTypes: false
      }
    },
    passwordHash: {}
  }
};
