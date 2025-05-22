# Dự án Điều khiển Bồn nước

Dự án hệ thống giám sát và điều khiển bồn nước sử dụng PLC và web interface.

## Cấu trúc dự án

- `index.js`: File chính khởi tạo web server và kết nối PLC
- `views/home.ejs`: Giao diện người dùng
- `public/`: Thư mục chứa tài nguyên tĩnh (CSS, JavaScript, Images)

## Yêu cầu hệ thống

- Node.js (phiên bản 16.x trở lên)
- MySQL (tùy chọn, có thể sử dụng Railway MySQL)

## Triển khai lên Railway

### Bước 1: Fork dự án này trên GitHub

### Bước 2: Đăng ký tài khoản Railway và cài đặt CLI

```bash
npm install -g @railway/cli
railway login
```

### Bước 3: Khởi tạo dự án Railway

```bash
railway init
```

### Bước 4: Cung cấp MySQL trên Railway

```bash
railway add
```

Chọn MySQL từ danh sách dịch vụ.

### Bước 5: Triển khai lên Railway

```bash
railway up
```

### Bước 6: Thiết lập biến môi trường

Thiết lập các biến môi trường sau trên Railway:

- `PLC_HOST`: Địa chỉ IP của PLC
- `PLC_PORT`: Cổng PLC (mặc định 102)
- `PLC_RACK`: Rack của PLC (mặc định 0)
- `PLC_SLOT`: Slot của PLC (mặc định 1)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Thông tin kết nối MySQL

### Bước 7: Tạo database và bảng alarm

Kết nối với MySQL của Railway và thực hiện các lệnh sau:

```sql
CREATE DATABASE SQL_PLC;
USE SQL_PLC;
CREATE TABLE alarm (
    date_time DATETIME,
    ID VARCHAR(50),
    Status VARCHAR(10),
    AlarmName VARCHAR(255)
);
```

### Bước 8: Khởi động lại ứng dụng

```bash
railway service restart
```

## Xử lý sự cố

Nếu gặp vấn đề khi triển khai, hãy kiểm tra:

1. Log của Railway để xem lỗi
2. Kiểm tra các biến môi trường đã được thiết lập đúng
3. Kiểm tra kết nối MySQL
4. Kiểm tra kết nối PLC 