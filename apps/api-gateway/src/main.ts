import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use(
    '/products',
    createProxyMiddleware({
      target: process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002',
      changeOrigin: true,
      pathRewrite: (path) => (path === '/' ? '/products' : `/products${path}`),
    }),
  );

  app.use(
    '/auth',
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: (path) => (path === '/' ? '/auth' : `/auth${path}`),
    }),
  );

  await app.listen(process.env.PORT ?? 8080);
}

await bootstrap();
