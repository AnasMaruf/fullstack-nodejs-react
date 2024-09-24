import { prismaClient } from "../application/database.js";
import productService from "../service/product-service.js";
import { getProductValidation } from "../validation/product-validation.js";
import { validate } from "../validation/validation.js";

const create = async (req, res, next) => {
  try {
    const result = await productService.create(req.user, req.body, req.file);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await productService.list(req.user);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const request = req.body;
    request.id = productId;
    const result = await productService.update(req.user, request, req.file);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.remove(req.user, req.params.productId);
    res.status(200).json({
      data: "OK",
    });
  } catch (e) {
    next(e);
  }
};

// const search = async (req, res, next) => {
//   try {
//     const request = {
//       name: req.query.name,
//     };
//     const result = await productService.search(req.user, request);
//     res.status(200).json({
//       data: result.data,
//       paging: result.paging,
//     });
//   } catch (e) {
//     next(e);
//   }
// };

const search = async (req, res, next) => {
  try {
    const emailUser = validate(getProductValidation, req.user.email);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search_query || "";
    const skip = limit * page;
    const totalRows = await prismaClient.product.count({
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
    });
    const totalPage = Math.ceil(totalRows / limit);
    const result = await productService.search(search, skip, limit, emailUser);
    return res.status(200).json({
      result: result,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (e) {
    next(e);
  }
};
export default { create, list, update, remove, search };
