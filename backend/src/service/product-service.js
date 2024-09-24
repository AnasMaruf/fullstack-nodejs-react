import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  createProductValidation,
  getIdProductValidation,
  getProductValidation,
  updateProductValidation,
} from "../validation/product-validation.js";
import { validate } from "../validation/validation.js";
import fs from "fs";

const create = async (user, request, file) => {
  const product = validate(createProductValidation, request);
  product.email_user = user.email;

  if (file) {
    product.image_path = file.filename;
  }

  return prismaClient.product.create({
    data: product,
    select: {
      id: true,
      name: true,
      price: true,
      image_path: true,
    },
  });
};
const list = async (user) => {
  const emailUser = validate(getProductValidation, user.email);
  const product = await prismaClient.product.findMany({
    where: {
      email_user: emailUser,
    },
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
    },
  });
  if (!product) {
    throw new ResponseError(404, "Product is not found");
  }
  return product;
};

const update = async (user, request, file) => {
  const product = validate(updateProductValidation, request);
  // Old Image
  const oldImage = await prismaClient.product.findFirst({
    where: {
      id: product.id,
    },
  });
  //jika ada file baru masukan file baru, jika tidak ada file baru masukan oldImagePath
  product.image_path = file ? file.filename : oldImage.image_path;
  const checkProduct = await prismaClient.product.count({
    where: {
      id: product.id,
      email_user: user.email,
    },
  });
  if (!checkProduct) {
    throw new ResponseError(404, "Product is not found");
  }

  const product_updated = await prismaClient.product.update({
    where: {
      id: product.id,
    },
    data: {
      name: product.name,
      price: product.price,
      description: product.description,
      image_path: product.image_path,
    },
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      image_path: true,
    },
  });
  if (product_updated.image_path !== oldImage.image_path) {
    const oldFilePath = `./public/images/${oldImage.image_path}`;

    // Cek jika file ada sebelum menghapusnya
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }
  return product_updated;
};

const remove = async (user, product_id) => {
  const product = validate(getIdProductValidation, product_id);
  const checkProduct = await prismaClient.product.count({
    where: {
      id: product,
      email_user: user.email,
    },
  });
  if (checkProduct !== 1) {
    throw new ResponseError(404, "Product is not found");
  }
  const product_delete = await prismaClient.product.findFirst({
    where: {
      id: product,
    },
  });
  await prismaClient.product.delete({
    where: {
      id: product,
    },
  });
  const filePath = `./public/images/${product_delete.image_path}`;
  fs.unlinkSync(filePath);
};

// const search = async (user, request) => {
//   request = validate(searchProductValidation, request);

//   // 1 ((page-1)*size) = 0
//   // 2 ((page-1)*size) = 10
//   const skip = (request.page - 1) * request.size;
//   const filters = [];
//   filters.push({ email: user.email });
//   if (request.name) {
//     filters.push({
//       name: {
//         contains: request.name,
//       },
//     });
//   }
//   const products = await prismaClient.product.findMany({
//     where: filters,
//     take: request.size,
//     skip: skip,
//   });
//   const totalItems = await prismaClient.product.count({
//     where: filters,
//   });
//   return {
//     data: products,
//     paging: {
//       page: request.page,
//       total_item: totalItems,
//       total_page: Math.ceil(totalItems / request.size),
//     },
//   };
// };

const search = async (search, skip, limit, emailUser) => {
  return prismaClient.product.findMany({
    where: {
      AND: [
        {
          name: {
            contains: search,
          },
        },
        {
          email_user: emailUser,
        },
      ],
    },
    skip: skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
  });
};

export default { create, list, update, remove, search };
