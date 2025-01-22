import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from "../../services/auth.service";

// mocking dependencies
jest.mock('@prisma/client', () => {
  const PrismaClient = jest.fn().mockImplementation(() => {
    return {
      user: {
        findMany: jest.fn()
      }
    };
  });

  return { PrismaClient };
});

jest.mock('bcryptjs', () => {
  return {
    compareSync: jest.fn()
  };
});

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn()
  };
});

const mockedPrisma = new PrismaClient();

let mockUser = {
  user_id: "1",
  username: "jane",
  email: "janedoe@yopmail.com",
  password_hash: "hashedPassword",
  first_name: "Jane",
  last_name: "Doe",
  phone_number: "+2541223344",
  is_deleted: false,
  profile_picture_url: "profile.jpg",
  role: "attendee",
  active: true,
  createdAt: "2024-06-12T17:52:53.234Z",
  updatedAt: "2024-06-12T17:52:53.234Z"
};

describe('authService', () => {
  let service: authService;

  beforeEach(() => {
    service = new authService();
    service.prisma = mockedPrisma;
    process.env.SECRET_KEY = 'secretkey';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if user is not found", async () => {
    (mockedPrisma.user.findMany as jest.Mock).mockResolvedValueOnce([]);

    const result = await service.login({ email: 'wrongemail@yopmail.com', password_hash: 'Pass@123' });

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        email: 'wrongemail@yopmail.com'
      }
    });
    expect(result).toEqual({ "error": "user not found" });
  });

  it('should return error if password is incorrect', async () => {
    (mockedPrisma.user.findMany as jest.Mock).mockResolvedValueOnce([mockUser]);

    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(false);

    const result = await service.login({ email: "janedoe@yopmail.com", password_hash: "incorrectPassword" });

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        email: 'janedoe@yopmail.com'
      }
    });

    expect(bcrypt.compareSync).toHaveBeenCalledWith("incorrectPassword", "hashedPassword");
    expect(result).toEqual({ error: "Incorrect password" });
  });

  it("should return success message and token if login is successful", async () => {
    (mockedPrisma.user.findMany as jest.Mock).mockResolvedValueOnce([mockUser]);

    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(true);
    (jwt.sign as jest.Mock).mockReturnValueOnce('correct_token');

    const result = await service.login({ email: "janedoe@yopmail.com", password_hash: "Password123" });

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        email: 'janedoe@yopmail.com'
      }
    });

    expect(bcrypt.compareSync).toHaveBeenCalledWith('Password123', 'hashedPassword');
    expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "1",
      username: "jane",
      email: "janedoe@yopmail.com"
    }), 'secretkey', { expiresIn: '1h' });

    expect(result).toEqual({
      message: "Logged in successfully",
      token: 'correct_token'
    });
  });
});
