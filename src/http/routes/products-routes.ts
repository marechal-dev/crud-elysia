import { Elysia, t } from "elysia";

import { productsController } from "../controllers/products-controller";

export function productsRoutes(app: Elysia) {
  app.get("/products", productsController.index);
  app.get("/products/:id", productsController.show);
  app.post("/products", productsController.create);
  app.put("/products/:id", productsController.update);
  app.delete("/products/:id", productsController.delete);
}
