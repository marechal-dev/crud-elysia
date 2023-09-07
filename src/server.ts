import { app as server } from "./app";

import { env } from "@Configs/env";

server
  .listen({
    hostname: '0.0.0.0',
    port: env.PORT,
  });
