import { prismaClient } from "../src/application/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const removeTestUser = async () => {
  await prismaClient.user.deleteMany({
    where: {
      email: "test@gmail.com",
    },
  });
};

const removeTestProduct = async () => {
  await prismaClient.product.deleteMany({
    where: {
      email_user: "test@gmail.com",
    },
  });
};

const createTestUser = async () => {
  await prismaClient.user.create({
    data: {
      email: "test@gmail.com",
      username: "test",
      password: await bcrypt.hash("test123", await bcrypt.genSalt()),
      token: jwt.sign(
        { email: "test@gmail.com" },
        process.env.ACCESS_TOKEN_SECRET
      ),
    },
  });
};

const getTestUser = async () => {
  return prismaClient.user.findFirst({
    where: {
      email: "test@gmail.com",
    },
  });
};

const createTestProduct = async () => {
  await prismaClient.product.create({
    data: {
      name: "test",
      price: 4000,
      description: "test",
      email_user: "test@gmail.com",
    },
  });
};

const getTestProduct = async () => {
  return prismaClient.product.findFirst({
    where: {
      email_user: "test@gmail.com",
    },
  });
};

const createManyTestContact = async () => {
  for (let i = 0; i < 15; i++) {
    await prismaClient.product.create({
      data: {
        name: "test",
      },
    });
  }
};

export {
  removeTestUser,
  removeTestProduct,
  createTestUser,
  createTestProduct,
  getTestProduct,
  getTestUser,
  createManyTestContact,
};
