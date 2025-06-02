# 🚀 Hướng Dẫn Deploy Lên Railway

## 📋 Chuẩn Bị

### 1. Repository đã được push lên GitHub
- ✅ Repository: `https://github.com/NTVuong23/bonnuoc_webserver.git`
- ✅ Branch: `bonnuoc_webserver`
- ✅ Tất cả file đã được commit và push

### 2. Tài khoản Railway
- Truy cập: https://railway.app/
- Đăng nhập bằng GitHub account

## 🛠️ Các Bước Deploy

### Bước 1: Tạo Project Mới
1. Vào Railway dashboard
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository `NTVuong23/bonnuoc_webserver`
5. **Quan trọng**: Chọn branch `bonnuoc_webserver`

### Bước 2: Thêm MySQL Database
1. Trong Railway project, click **"+ New"**
2. Chọn **"Database"** → **"MySQL"**
3. Railway sẽ tự động tạo database và cung cấp connection details

### Bước 3: Cấu Hình Environment Variables
Trong Railway project settings, thêm các biến môi trường:

```env
# Database (Copy từ MySQL service Railway tạo)
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQL_DATABASE=railway
MYSQLUSER=root
MYSQL_ROOT_PASSWORD=<password_from_railway>
MYSQLPORT=3306

# Server
PORT=3000
NODE_ENV=production
RAILWAY_ENVIRONMENT=production

# MQTT (Optional - sử dụng public broker)
MQTT_HOST=broker.emqx.io
MQTT_PORT=1883
MQTT_USE_SSL=false

# App Info
APP_NAME=Bonnuoc Water Tank Monitoring System
APP_VERSION=1.0.0
```

### Bước 4: Deploy
1. Railway sẽ tự động detect Node.js project
2. Sử dụng `railway.json` config có sẵn
3. Start command: `node index.js`
4. Build sẽ tự động chạy

## 🔧 Xử Lý Vấn Đề MQTT

### Vấn đề: Không nhận được dữ liệu MQTT
**Nguyên nhân**: Railway có thể block một số MQTT broker hoặc có vấn đề network

**Giải pháp đã implement**:
1. **Fallback Simulation**: Tự động chuyển sang simulation mode sau 15 giây
2. **Multiple MQTT Brokers**: Thử các broker khác nhau
3. **Better Error Handling**: Log chi tiết để debug

### Cấu hình MQTT Brokers
Thử các broker sau nếu có vấn đề:

```env
# Option 1: EMQX (Recommended for Railway)
MQTT_HOST=broker.emqx.io
MQTT_PORT=1883

# Option 2: HiveMQ Public
MQTT_HOST=broker.hivemq.com
MQTT_PORT=1883

# Option 3: Mosquitto Test
MQTT_HOST=test.mosquitto.org
MQTT_PORT=1883
```

## 📊 Kiểm Tra Deployment

### 1. Logs
- Vào Railway project → Service → Logs
- Kiểm tra:
  ```
  ✅ Server đang chạy tại http://localhost:3000
  ✅ Kết nối MySQL thành công!
  🌐 Môi trường: Railway (Production)
  🔗 Kết nối đến MQTT broker: mqtt://broker.emqx.io:1883
  ```

### 2. Database
- Kiểm tra bảng `alarm` được tạo tự động
- Test chức năng xuất Excel

### 3. MQTT Status
- Nếu thấy: `⚠️ Không nhận được dữ liệu từ MQTT trong 15 giây`
- Và: `🎭 Bắt đầu simulation mode để đảm bảo giao diện hoạt động...`
- → **Bình thường**: Simulation sẽ cung cấp dữ liệu demo

## 🎭 Simulation Mode

### Tính năng
- Tự động kích hoạt khi không có MQTT
- Dữ liệu thực tế: mức nước, áp suất, trạng thái thiết bị
- Chu kỳ hoạt động như hệ thống thật
- Tạo cảnh báo để test chức năng

### Dữ liệu Simulation
- **Mức nước**: 20-80% theo chu kỳ 2 phút
- **Áp suất**: 0.2-3.0 bar tùy theo trạng thái bơm
- **Bơm**: Tự động bật/tắt theo logic thực tế
- **Cảnh báo**: Over_Pressure, Lack_of_Pressure, etc.

## 🔗 URLs và Thông Tin

### Railway URLs
- **Project Dashboard**: https://railway.app/project/your-project-id
- **Public URL**: https://your-app-name.up.railway.app
- **Database URL**: Trong MySQL service settings

### GitHub
- **Repository**: https://github.com/NTVuong23/bonnuoc_webserver.git
- **Branch**: bonnuoc_webserver

## 🆘 Troubleshooting

### Lỗi Database Connection
```bash
# Kiểm tra environment variables
echo $MYSQLHOST
echo $MYSQL_DATABASE
```

### Lỗi MQTT
```bash
# Logs sẽ hiển thị
❌ Lỗi kết nối MQTT: [error details]
🎭 Bắt đầu simulation mode...
```

### Lỗi Excel Export
- Kiểm tra thư mục `public/Report` được tạo
- Kiểm tra quyền ghi file trên Railway

## ✅ Checklist Deploy Thành Công

- [ ] Project được tạo từ branch `bonnuoc_webserver`
- [ ] MySQL database được thêm và kết nối
- [ ] Environment variables được cấu hình đúng
- [ ] Server start thành công (check logs)
- [ ] Giao diện web accessible qua public URL
- [ ] Simulation mode hoạt động (nếu không có MQTT)
- [ ] Chức năng xuất Excel hoạt động
- [ ] Database alarm table được tạo

**🎉 Deployment thành công! Hệ thống sẽ hoạt động với simulation data nếu không có MQTT thực tế.**
