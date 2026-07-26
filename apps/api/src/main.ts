import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  // rawBody: true lets the Paystack webhook handler verify the
  // x-paystack-signature HMAC against the exact request bytes.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Railway (and most PaaS) terminate TLS at an edge proxy and forward plain
  // HTTP — trust proxy so req.protocol/req.ip reflect the original request.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true,
  });

  // Railway injects PORT at runtime; API_PORT stays as the local-dev override.
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  console.log(`EagleHire API listening on port ${port}`);
}

bootstrap();
