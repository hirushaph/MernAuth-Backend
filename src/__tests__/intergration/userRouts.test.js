const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const UserModel = require("../../models/userModel");

// describe("POST /register", () => {
//   it("should get test message", async () => {
//     const { body } = await request(app).get("/test");

//     expect(body).toEqual([
//       expect.objectContaining({
//         message: "its working",
//       }),
//     ]);
//   });
// });

const testUser = {
  username: "testUser",
  email: "test@example.com",
  password: "Hello@123455",
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL_TEST).then(() => {
    console.log("db connected");
  });
});

afterAll(async () => {
  await UserModel.deleteOne({ username: "testUser" });
  await mongoose.connection.close();
});

describe("POST /register", () => {
  test("It should create new user", async () => {
    const response = await request(app).post("/api/v1/register").send(testUser);
    expect(response.statusCode).toBe(201);
    // expect(response.body).toEqual({ helo: "hello" });
  });
});
