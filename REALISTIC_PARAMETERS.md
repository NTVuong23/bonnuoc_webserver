# 🏭 Thông Số Hệ Thống Bồn Nước Thực Tế

## 📊 Thông Số Vật Lý

### **Bồn Nước**
- **Dung tích**: 1000 lít
- **Chiều cao**: 3.0 mét  
- **Đường kính**: 1.5 mét
- **Mức tối thiểu**: 10% (100 lít)
- **Mức tối đa**: 95% (950 lít)
- **Mức cảnh báo thấp**: 15% (150 lít)
- **Mức cảnh báo cao**: 90% (900 lít)

### **Bơm Nước**
- **Lưu lượng**: 50 lít/phút
- **Áp suất tối đa**: 4.0 bar
- **Điện áp định mức**: 220V ±15V
- **Công suất**: 1.5 kW
- **Áp suất khởi động**: 1.0 bar
- **Áp suất dừng**: 2.8 bar

### **Hệ Thống Áp Suất**
- **Áp suất tĩnh**: 0.098 bar/mét chiều cao
- **Áp suất động**: 2.0 bar (khi bơm chạy)
- **Áp suất cảnh báo cao**: >3.5 bar
- **Áp suất cảnh báo thấp**: <0.5 bar

## ⏰ Mô Hình Tiêu Thụ Theo Giờ

### **Giờ Cao Điểm**
- **06:00-08:00**: 35 lít/phút (sáng)
- **11:00-13:00**: 30 lít/phút (trưa)  
- **17:00-20:00**: 40 lít/phút (tối)

### **Giờ Bình Thường**
- **08:00-11:00**: 20 lít/phút
- **13:00-17:00**: 18 lít/phút
- **20:00-22:00**: 15 lít/phút

### **Giờ Thấp Điểm**
- **22:00-06:00**: 8 lít/phút (đêm)

## 🔄 Logic Điều Khiển Tự Động

### **Điều Kiện Bật Bơm**
- Mức nước ≤ 25% HOẶC
- Áp suất ≤ 1.0 bar

### **Điều Kiện Tắt Bơm**
- Mức nước ≥ 75% VÀ
- Áp suất ≥ 2.8 bar

### **Điều Khiển Van**
- **Mở van**: Mức nước < 70%
- **Đóng van**: Mức nước ≥ 70%

## 🚨 Hệ Thống Cảnh Báo

### **Cảnh Báo Mức Nước**
- **LOW_LEVEL**: Mức nước ≤ 15%
- **HIGH_LEVEL**: Mức nước ≥ 90%

### **Cảnh Báo Áp Suất**
- **OVER_PRESSURE**: Áp suất > 3.5 bar
- **LACK_PRESSURE**: Áp suất < 0.5 bar (khi bơm chạy)

### **Cảnh Báo Điện**
- **OVER_VOLTAGE**: Điện áp > 235V
- **UNDER_VOLTAGE**: Điện áp < 205V (khi bơm chạy)

### **Cảnh Báo Nhiệt Độ**
- **HIGH_TEMP**: Nhiệt độ > 35°C

### **Cảnh Báo Bảo Trì**
- **PUMP_OVERRUN**: Bơm chạy liên tục > 60 phút
- **MAINTENANCE_DUE**: Sau mỗi 50 chu kỳ bơm

## 📈 Thông Số Hoạt Động

### **Điện Áp Bơm**
- **Không tải**: 0V
- **Hoạt động bình thường**: 205-235V
- **Biến thiên**: ±15V tùy theo áp suất và tải

### **Dòng Điện**
- **Công thức**: I = P / V
- **Điều chỉnh**: Tăng theo áp suất (tải cao hơn)
- **Phạm vi**: 6-8A

### **Nhiệt Độ**
- **Nhiệt độ môi trường**: 25°C
- **Biến thiên**: ±5°C theo chu kỳ
- **Nhiễu ngẫu nhiên**: ±2°C

## 🔧 Tính Năng Nâng Cao

### **Theo Dõi Hiệu Suất**
- **Thời gian chạy bơm**: Tích lũy theo phút
- **Số chu kỳ bơm**: Đếm số lần bật/tắt
- **Tiêu thụ hàng ngày**: Tổng lít đã sử dụng
- **Công suất tiêu thụ**: kW theo thời gian thực

### **Chế Độ Hoạt Động**
- **AUTO**: Điều khiển tự động theo logic
- **MANUAL**: Điều khiển thủ công
- **EMERGENCY**: Dừng khẩn cấp tất cả thiết bị

### **Mô Phỏng Sự Cố**
- **Emergency**: 1% cơ hội mỗi chu kỳ
- **Chuyển chế độ**: 3% cơ hội mỗi chu kỳ
- **Biến thiên ngẫu nhiên**: ±20% lưu lượng tiêu thụ

## 📊 Dữ Liệu Đầu Ra

### **Cảm Biến Chính**
```json
{
  "Sensors_Level": 45,           // % mức nước
  "Sensors_Pressure": 1.8,       // bar áp suất
  "Temperature": 25.3,           // °C nhiệt độ
  "Value_Vollt_Actual": 220.5,   // V điện áp
  "Current_Actual": 6.8,         // A dòng điện
  "Power_Consumption": 1.5       // kW công suất
}
```

### **Trạng Thái Thiết Bị**
```json
{
  "Running_Pump": 1,             // 0/1 trạng thái bơm
  "Valve_Solenoid": 1,           // 0/1 trạng thái van
  "Auto_Mode": true,             // true/false chế độ
  "Emergency": false             // true/false khẩn cấp
}
```

### **Thông Tin Vận Hành**
```json
{
  "Pump_Runtime": 45.2,          // phút đã chạy
  "Daily_Consumption": 1250.5,   // lít tiêu thụ
  "Pump_Cycles": 15,             // số chu kỳ
  "Peak_Hours": true             // giờ cao điểm
}
```

## 🎯 Ưu Điểm Mô Phỏng Thực Tế

### **Vật Lý Chính Xác**
- Tính toán dựa trên flow balance thực tế
- Áp suất theo định luật thủy tĩnh
- Hysteresis control tránh dao động

### **Hành Vi Thực Tế**
- Tiêu thụ nước theo giờ trong ngày
- Biến thiên ngẫu nhiên hợp lý
- Sự cố và bảo trì định kỳ

### **Dữ Liệu Phong Phú**
- Nhiều thông số theo dõi
- Lịch sử hoạt động
- Cảnh báo đa dạng

### **Tương Tác Thực Tế**
- Phản ứng đúng với điều khiển
- Trạng thái liên tục và logic
- Cảnh báo có ý nghĩa

**🎉 Mô phỏng này tạo ra dữ liệu gần như hệ thống thật, phù hợp cho demo, test và training!**
