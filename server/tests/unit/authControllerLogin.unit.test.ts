import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUserByEmail, validatePassword } = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  validatePassword: vi.fn(),
}));

vi.mock("../../src/services/userService", () => ({
  findUserByEmail,
  validatePassword,
}));

vi.mock("../../src/config/jwt", () => ({
  generateToken: vi.fn(() => "token-falso"),
}));

import { login } from "../../src/controllers/authControllerLogin";

function createResponseMock() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);
  vi.mocked(response.json).mockReturnValue(response);

  return response;
}

describe("authControllerLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the same failure response for nonexistent email and wrong password", async () => {
    const missingUserReq = {
      body: { email: "ghost@example.com", password: "Password123!" },
    } as Request;
    const missingUserRes = createResponseMock();

    findUserByEmail.mockResolvedValueOnce(null);
    validatePassword.mockResolvedValueOnce(false);

    await login(missingUserReq, missingUserRes);

    expect(validatePassword).toHaveBeenCalledTimes(1);
    expect(missingUserRes.status).toHaveBeenCalledWith(401);

    const missingUserBody = vi.mocked(missingUserRes.json).mock.calls[0]?.[0];

    const wrongPasswordReq = {
      body: { email: "user@example.com", password: "Password123!" },
    } as Request;
    const wrongPasswordRes = createResponseMock();

    findUserByEmail.mockResolvedValueOnce({
      id: 10,
      name: "User",
      email: "user@example.com",
      password: "$2b$10$stored-hash-example.................",
      role: "CLIENT",
    });
    validatePassword.mockResolvedValueOnce(false);

    await login(wrongPasswordReq, wrongPasswordRes);

    expect(validatePassword).toHaveBeenCalledTimes(2);
    expect(wrongPasswordRes.status).toHaveBeenCalledWith(401);
    expect(vi.mocked(wrongPasswordRes.json).mock.calls[0]?.[0]).toEqual(missingUserBody);
  });

  it("always invokes password verification even when the user does not exist", async () => {
    const req = {
      body: { email: "ghost@example.com", password: "Password123!" },
    } as Request;
    const res = createResponseMock();

    findUserByEmail.mockResolvedValueOnce(null);
    validatePassword.mockResolvedValueOnce(false);

    await login(req, res);

    expect(validatePassword).toHaveBeenCalledWith("Password123!", expect.any(String));
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
