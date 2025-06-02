# 🏭 Hệ Thống Giám Sát Bồn Nước - Water Tank Monitoring System

Hệ thống giám sát và điều khiển bồn nước thông minh với giao diện web hiện đại, tích hợp PLC và MQTT.

## ✨ Tính Năng Chính

### 🎛️ Giám Sát Thời Gian Thực
- **Mức nước**: Hiển thị mức nước hiện tại và phần trăm
- **Áp suất**: Theo dõi áp suất hệ thống
- **Điện áp**: Giám sát điện áp hoạt động
- **Trạng thái thiết bị**: Pump, van điện từ, đèn báo

### 🚨 Hệ Thống Cảnh Báo
- **Cảnh báo thời gian thực**: Thiếu áp suất, quá áp suất, quá điện áp
- **Lưu trữ lịch sử**: Tất cả cảnh báo được lưu vào database
- **Xuất báo cáo Excel**: Với dialog lưu file và notification system

### 🎮 Điều Khiển
- **Chế độ Auto/Manual**: Chuyển đổi linh hoạt
- **Điều khiển thiết bị**: Bật/tắt pump, van điện từ
- **Cài đặt setpoint**: Mức nước và áp suất mong muốn

### 📊 Báo Cáo & Xuất Dữ Liệu
- **Xuất Excel cải tiến**: Dialog lưu file, progress notification
- **Tìm kiếm theo thời gian**: Lọc dữ liệu cảnh báo
- **Hiển thị thống kê**: Số lượng bản ghi, kích thước file

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Node.js** + **Express.js**: Web server
- **Socket.IO**: Real-time communication
- **MySQL**: Database lưu trữ
- **MQTT**: IoT communication protocol
- **ExcelJS**: Xuất báo cáo Excel

### Frontend
- **EJS**: Template engine
- **Bootstrap**: UI framework
- **jQuery**: DOM manipulation
- **Chart.js**: Data visualization

### IoT & Automation
- **PLC S7**: Industrial automation
- **MQTT Broker**: Message queuing
- **Nodes7**: PLC communication library

## 🚀 Deployment

### Railway Deployment
```bash
# Clone repository
git clone https://github.com/NTVuong23/bonnuoc_webserver.git

# Install dependencies
npm install

# Start application
npm start
```

### Environment Variables
```env
# Database Configuration
MYSQLHOST=localhost
MYSQL_DATABASE=SQL_PLC
MYSQLUSER=root
MYSQL_ROOT_PASSWORD=your_password
MYSQLPORT=3306

# Server Configuration
PORT=3000
```

## 📱 Giao Diện

### Dashboard Chính
- Hiển thị tất cả thông số thời gian thực
- Biểu đồ trực quan mức nước và áp suất
- Trạng thái thiết bị với màu sắc trực quan

### Màn Hình Cảnh Báo
- Danh sách cảnh báo theo thời gian thực
- Tìm kiếm và lọc dữ liệu
- Xuất báo cáo Excel với notification system

### Điều Khiển
- Giao diện điều khiển trực quan
- Chuyển đổi chế độ Auto/Manual
- Cài đặt setpoint

## 🔧 Cài Đặt Local

1. **Clone repository**
```bash
git clone https://github.com/NTVuong23/bonnuoc_webserver.git
cd bonnuoc_webserver
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
- Tạo database MySQL tên `SQL_PLC`
- Bảng `alarm` sẽ được tạo tự động

4. **Start server**
```bash
npm start
# hoặc development mode
npm run dev
```

5. **Truy cập ứng dụng**
```
http://localhost:3000
```

## 📈 Tính Năng Mới

### Excel Export Cải Tiến
- ✅ **Dialog lưu file**: Người dùng chọn vị trí lưu
- ✅ **Notification system**: Thông báo trạng thái xuất
- ✅ **Progress feedback**: Loading animation
- ✅ **Error handling**: Xử lý lỗi toàn diện
- ✅ **File info**: Hiển thị kích thước và số lượng bản ghi

### UI/UX Improvements
- ✅ **Responsive design**: Tương thích mobile
- ✅ **Real-time updates**: Cập nhật không cần refresh
- ✅ **Visual feedback**: Animation và transition
- ✅ **Error messages**: Thông báo lỗi cụ thể

## 👥 Đóng Góp

Dự án được phát triển bởi nhóm sinh viên Trường Đại Học Sư Phạm Kỹ Thuật TP.HCM.

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
