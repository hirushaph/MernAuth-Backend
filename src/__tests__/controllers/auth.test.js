const { registerUser } = require("../../controllers/authController"); // Assuming your function is in registerUser.js
const UserModel = require("../../models/userModel"); // Assuming UserModel is imported or defined somewhere

jest.mock("../../models/userModel");

//Define Mock Implementations
UserModel.exists.mockImplementation(async ({ username, email }) => {
  if (username === "existingUser") return true; // Mock existing username
  if (email === "test@example.com") return true; // Mock existing email
  return false;
});

describe("Register User Function", () => {
  beforeEach(() => {
    // Reset req and res objects before each test
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    // clear mock values after each test
    jest.clearAllMocks();
  });

  it("should return error if username field is missing", async () => {
    const req = {
      body: { email: "test@example.com", password: "testpassword" },
    };

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Username is required" });
  });

  it("shoud return error if email field is missing", async () => {
    const req = {
      body: { username: "testusername", password: "testpassword" },
    };

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Email is required" });
  });

  it("should return an error if password is missing", async () => {
    req.body = {
      username: "testUser",
      email: "test@example.com",
    };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Password is required" });
  });

  it("should return an error if email is invalid", async () => {
    req.body = {
      username: "testUser",
      email: "test@example",
      password: "testPassword",
    };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Email is not valid" });
  });

  it("should return an error if password is weak", async () => {
    req.body = {
      username: "testUser",
      email: "test@example.com",
      password: "weakpass",
    };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Password must be strong" });
  });

  it("should return an error if username already exists", async () => {
    req.body = {
      username: "existingUser",
      email: "new@example.com",
      password: "Strong@Password123",
    };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ errors: ["Username unavaliable"] });
  });

  it("should return an error if email already exists", async () => {
    req.body = {
      username: "newUser",
      email: "test@example.com",
      password: "Strong@Password123",
    };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ errors: ["Email already in use"] });
  });
});
