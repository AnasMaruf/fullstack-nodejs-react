import supertest from "supertest";
import {
  createManyTestContact,
  createTestProduct,
  createTestUser,
  getTestProduct,
  getTestUser,
  removeTestProduct,
  removeTestUser,
} from "./test-util";
import { web } from "../src/application/web";
import jwt from "jsonwebtoken";
import { logger } from "../src/application/logging";
import cookieParser from "cookie-parser";

describe("POST /api/products", () => {
  beforeEach(async () => {
    await createTestUser();
  });
  afterEach(async () => {
    await removeTestProduct();
    await removeTestUser();
  });

  it("Should can create new product", async () => {
    const testUser = await getTestUser();
    const cookies = `refreshToken=${testUser.token};`;
    const token = jwt.sign(
      { email: "test@gmail.com" },
      process.env.ACCESS_TOKEN_SECRET
    );
    const result = await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .set("Cookie", cookies)
      .send({
        name: "test",
        price: 4000,
        description: "test",
      });
    expect(result.status).toBe(200);
    expect(result.body.data.id).toBeDefined();
    expect(result.body.data.name).toBe("test");
    expect(result.body.data.price).toBe(4000);
    expect(result.body.data.description).toBe("test");
  });

  it("Should can reject if request is invalid", async () => {
    const testUser = await getTestUser();
    const cookies = `refreshToken=${testUser.token};`;
    const token = jwt.sign(
      { email: "test@gmail.com" },
      process.env.ACCESS_TOKEN_SECRET
    );
    const result = await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .set("Cookie", cookies)
      .send({
        name: "",
        price: null,
        description: "",
      });
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("Should can reject if token is not valid", async () => {
    const testUser = await getTestUser();
    const cookies = `refreshToken=${testUser.token};`;
    const token = jwt.sign(
      { email: "test@gmail.com" },
      process.env.ACCESS_TOKEN_SECRET
    );
    const result = await supertest(web)
      .post("/api/products")
      .set("Authorization", `${token}`)
      .set("Cookie", cookies)
      .send({
        name: "test",
        price: 4000,
        description: "test",
      });
    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });

  it("Should can reject if verify token is not valid", async () => {
    const testUser = await getTestUser();
    const cookies = `refreshToken=${testUser.token};`;
    const token = jwt.sign(
      { email: "test@gmail.com" },
      process.env.ACCESS_TOKEN_SECRET
    );
    const result = await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}a`)
      .set("Cookie", cookies)
      .send({
        name: "test",
        price: 4000,
        description: "test",
      });
    logger.error(result.body);
    expect(result.status).toBe(403);
    expect(result.body.errors).toBeDefined();
  });
});

// describe("GET /api/products", () => {
//   beforeEach(async () => {
//     await createTestUser();
//     await createTestProduct();
//   });
//   afterEach(async () => {
//     await removeTestProduct();
//     await removeTestUser();
//   });

//   it("Should can get product", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const result = await supertest(web)
//       .get("/api/products")
//       .set("Authorization", `Bearer ${token}`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(200);
//     expect(result.body.data.length).toBe(8);
//   });

//   it("Should reject if token is not valid", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const result = await supertest(web)
//       .get("/api/products")
//       .set("Authorization", `${token}`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(401);
//     expect(result.body.errors).toBeDefined();
//   });

//   it("Should reject if verify token is not valid", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const result = await supertest(web)
//       .get("/api/products")
//       .set("Authorization", `Bearer ${token}a`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(403);
//     expect(result.body.errors).toBeDefined();
//   });
// });

// describe("PUT /api/products/:productId", () => {
//   beforeEach(async () => {
//     await createTestUser();
//     await createTestProduct();
//   });
//   afterEach(async () => {
//     await removeTestProduct();
//     await removeTestUser();
//   });
//   it("Should can update products", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .put(`/api/products/` + productId.id)
//       .set("Authorization", `Bearer ${token}`)
//       .set("Cookie", cookies)
//       .send({
//         name: "test",
//         price: 4000,
//         description: "updated desc",
//       });
//     expect(result.status).toBe(200);
//     expect(result.body.data.name).toBe("test");
//     expect(result.body.data.price).toBe(4000);
//     expect(result.body.data.description).toBe("updated desc");
//   });

//   it("Should reject if product is not found", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .put(`/api/products/${productId.id + 1}`)
//       .set("Authorization", `Bearer ${token}`)
//       .set("Cookie", cookies)
//       .send({
//         name: "updated test",
//         price: 5000,
//         description: "updated desc",
//       });
//     expect(result.status).toBe(404);
//     expect(result.body.errors).toBeDefined();
//   });

//   it("Should reject if token is not valid", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .put(`/api/products/${productId.id}`)
//       .set("Authorization", `${token}`)
//       .set("Cookie", cookies)
//       .send({
//         name: "updated test",
//         price: 5000,
//         description: "updated desc",
//       });
//     expect(result.status).toBe(401);
//     expect(result.body.errors).toBeDefined();
//   });

//   it("Should reject if verify token is not valid", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .put(`/api/products/${productId.id}`)
//       .set("Authorization", `Bearer ${token}a`)
//       .set("Cookie", cookies)
//       .send({
//         name: "updated test",
//         price: 5000,
//         description: "updated desc",
//       });
//     expect(result.status).toBe(403);
//     expect(result.body.errors).toBeDefined();
//   });

//   it("Should reject if request is not valid", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .put(`/api/products/${productId.id}`)
//       .set("Authorization", `Bearer ${token}`)
//       .set("Cookie", cookies)
//       .send({
//         name: "test",
//         price: 4000,
//         description: "",
//       });
//     expect(result.status).toBe(400);
//     expect(result.body.errors).toBeDefined();
//   });
// });

// describe("DELETE /api/products/:product", () => {
//   beforeEach(async () => {
//     await createTestUser();
//     await createTestProduct();
//   });
//   afterEach(async () => {
//     await removeTestProduct();
//     await removeTestUser();
//   });

//   it("Should can remove product", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .delete(`/api/products/${productId.id}`)
//       .set("Authorization", `Bearer ${token}`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(200);
//     expect(result.body.data).toBe("OK");
//   });

//   it("Should reject if product is not found", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .delete(`/api/products/${productId.id + 1}`)
//       .set("Authorization", `Bearer ${token}`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(404);
//     expect(result.body.errors).toBeDefined();
//   });

//   it("Should reject if token is not valid", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .delete(`/api/products/${productId.id}`)
//       .set("Authorization", `${token}`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(401);
//     expect(result.body.errors).toBeDefined();
//   });

//   it("Should reject if verify token is not valid", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     const productId = await getTestProduct();
//     const result = await supertest(web)
//       .delete(`/api/products/${productId.id}`)
//       .set("Authorization", `Bearer ${token}a`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(403);
//     expect(result.body.errors).toBeDefined();
//   });
// });

// describe("GET /api/products", () => {
//   beforeEach(async () => {
//     await createTestUser();
//     await createManyTestContact();
//   });
//   afterEach(async () => {
//     await removeTestProduct();
//     await removeTestUser();
//   });
//   it("Should can search without parameter", async () => {
//     const testUser = await getTestUser();
//     const cookies = `refreshToken=${testUser.token};`;
//     const token = jwt.sign(
//       { email: "test@gmail.com" },
//       process.env.ACCESS_TOKEN_SECRET
//     );

//     const result = await supertest(web)
//       .get("/api/products")
//       .set("Authorization", `Bearer ${token}`)
//       .set("Cookie", cookies);

//     expect(result.status).toBe(200);
//     expect(result.body.data.length).toBe(10);
//     expect(result.body.paging.page).toBe(1);
//     expect(result.body.paging.total_page).toBe(2);
//     expect(result.body.paging.total_item).toBe(15);
//   });
// });
