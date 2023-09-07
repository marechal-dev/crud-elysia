import { Context } from "elysia";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

import { prisma } from "@Libs/prisma";
import { isNotEmpty } from "elysia/handler";

const fetchManyProductsQuerySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
});

const showProductParamsSchema = z.object({
  id: z.string().uuid(),
});

const createProductBodySchema = z.object({
  title: z.string(),
  price: z.number().positive(),
  sku: z.string(),
});

const updateProductBodySchema = z.object({
  title: z.string(),
  price: z.number().positive().optional(),
});

const updateProductParamsSchema = z.object({
  id: z.string().uuid(),
});

const deleteProductParamsSchema = z.object({
  id: z.string().uuid(),
});

class ProductsController {
  private readonly prisma: PrismaClient;

  public constructor() {
    this.prisma = prisma;
  }

  public async index({ query, set }: Context) {
    const { page, pageSize } = fetchManyProductsQuerySchema.parse(query);

    const skipValue = (page - 1) * pageSize;
    const [totalCount, products] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        skip: skipValue,
        take: pageSize,
      })
    ]);

    set.status = 200;
    return {
      items: products.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      })),
      currentPage: page,
      pageSize,
      totalCount,
      hasNextPage: page * pageSize < totalCount,
      hasPreviousPage: page > 1,
    };
  }

  public async show({ params, set }: Context) {
    const { id } = showProductParamsSchema.parse(params);

    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      set.status = 404;

      return {
        status: 'Not Found',
        message: 'Product not found',
      };
    }

    set.status = 200;
    return {
      ...product,
      price: product.price.toNumber(),
    };
  }

  public async create({ body, set }: Context) {
    const { title, price, sku } = createProductBodySchema.parse(body);

    const product = await this.prisma.product.create({
      data: {
        title,
        price,
        sku,
      }
    });

    set.status = 201;
    return {
      ...product,
      price: product.price.toNumber(),
    };
  }

  public async update({ params, body, set }: Context) {
    const { id } = updateProductParamsSchema.parse(params);
    const { title, price } = updateProductBodySchema.parse(body);

    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      set.status = 404;
      return {
        status: 'Not Found',
        message: 'Product not found',
      };
    }

    const updatedProduct = await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        title,
        price: price ? new Decimal(price) : product.price,
      },
    });

    set.status = 200;
    return {
      ...updatedProduct,
      price: updatedProduct.price.toNumber(),
    };
  }

  public async delete({ params, set }: Context) {
    const { id } = deleteProductParamsSchema.parse(params);

    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      set.status = 404;
      return {
        status: 'Not Found',
        message: 'Product not found',
      };
    }

    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    set.status = 204;
  }
}

export const productsController = new ProductsController();
