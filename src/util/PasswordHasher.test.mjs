import { PasswordHasher } from "./PasswordHasher.mjs";
import { test, expect } from "@jest/globals";

test("PasswordHasher: Same Password", async () => {
  const hasher = new PasswordHasher({});
  const password = "password";

  const hash = await hasher.hash(password);
  expect(await hasher.verify(hash, password)).toBe(true);
});

test("PasswordHasher: Different Passwords", async () => {
  const hasher = new PasswordHasher({});
  const password1 = "password1";
  const password2 = "password2";

  const hash1 = await hasher.hash(password1);
  const hash2 = await hasher.hash(password2);

  expect(await hasher.verify(hash1, password2)).toBe(false);
  expect(await hasher.verify(hash2, password1)).toBe(false);
});
