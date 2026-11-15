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

  app.use(
    '/cart',
    createProxyMiddleware({
      target: process.env.CART_SERVICE_URL ?? 'http://localhost:3003',
      changeOrigin: true,
      pathRewrite: (path) => (path === '/' ? '/cart' : `/cart${path}`),
    }),
  );

  app.use(
    '/inventory',
    createProxyMiddleware({
      target: process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3004',
      changeOrigin: true,
      pathRewrite: (path) => (path === '/' ? '/inventory' : `/inventory${path}`),
    }),
  );

  app.use(
    '/orders',
    createProxyMiddleware({
      target: process.env.ORDER_SERVICE_URL ?? 'http://localhost:3005',
      changeOrigin: true,
      pathRewrite: (path) => (path === '/' ? '/orders' : `/orders${path}`),
    }),
  );

  await app.listen(process.env.PORT ?? 8080);
}

await bootstrap();