# Shopdemo

Dự án thương mại điện tử theo kiến trúc microservices.

## Cấu trúc

- `apps/api-gateway`: API Gateway
- `apps/auth-service`: xác thực và phân quyền
- `apps/product-service`: quản lý sản phẩm
- `apps/inventory-service`: quản lý tồn kho
- `apps/order-service`: quản lý đơn hàng
- `frontend/user-interface`: giao diện người dùng
- `docs`: tài liệu kiến trúc, API contract, ảnh chụp và kết quả kiểm thử

## Chạy bằng Docker Compose

```bash
docker compose up --build
```

> Các service hiện là khung dự án ban đầu; hãy bổ sung `Dockerfile` và mã nguồn cho từng service khi triển khai.

