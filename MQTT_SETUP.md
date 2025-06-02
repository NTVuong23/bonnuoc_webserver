# 📡 Hướng Dẫn Setup MQTT Data Publisher

## 🎯 Mục đích
Để Railway app nhận được dữ liệu thật từ MQTT topics `plc/data`, bạn cần có một nguồn dữ liệu publish đến topics đó.

## 🔧 Cách 1: Sử dụng MQTT Test Publisher (Đơn giản nhất)

### Bước 1: Cập nhật MQTT credentials
Mở file `mqtt-test-publisher.js` và cập nhật:

```javascript
const mqttUsername = 'your_actual_username'; // Username HiveMQ Cloud của bạn
const mqttPassword = 'your_actual_password'; // Password HiveMQ Cloud của bạn
```

### Bước 2: Chạy publisher từ máy local
```bash
# Cài đặt dependencies
npm install

# Chạy publisher với credentials
MQTT_USERNAME=your_username MQTT_PASSWORD=your_password npm run mqtt-publisher

# Hoặc chỉnh sửa trực tiếp trong file và chạy
node mqtt-test-publisher.js
```

### Bước 3: Kiểm tra logs
Publisher sẽ hiển thị:
```
✅ Đã kết nối đến MQTT Broker thành công!
📤 Published Step 1: Level=45%, Pressure=2.1bar, Pump=1
📤 Published Step 2: Level=47%, Pressure=2.3bar, Pump=1
```

Railway app sẽ hiển thị:
```
📥 Nhận tin nhắn từ topic plc/data: {"Sensors_Level":45,"Sensors_Pressure":2.1...
✅ Dữ liệu MQTT nhận được: {level: 45, pressure: 2.1, pump: 1}
🎯 Nhận được dữ liệu MQTT thật, dừng simulation mode...
```

## 🔧 Cách 2: Deploy Publisher lên Railway (Tự động)

### Bước 1: Tạo service mới trên Railway
1. Trong Railway project, click **"+ New"**
2. Chọn **"GitHub Repo"** 
3. Chọn cùng repository `bonnuoc_webserver`
4. Đặt tên service: `mqtt-publisher`

### Bước 2: Cấu hình environment variables cho publisher
```env
MQTT_USERNAME=your_hivemq_username
MQTT_PASSWORD=your_hivemq_password
```

### Bước 3: Cấu hình start command
Trong Railway settings của publisher service:
- **Start Command**: `node mqtt-test-publisher.js`

### Bước 4: Deploy
Publisher sẽ tự động chạy và gửi dữ liệu đến main app.

## 🔧 Cách 3: Sử dụng Node-RED (Nâng cao)

### Bước 1: Setup Node-RED
```bash
npm install -g node-red
node-red
```

### Bước 2: Tạo flow
1. Mở http://localhost:1880
2. Kéo nodes: `inject` → `function` → `mqtt out`
3. Cấu hình MQTT out node:
   - Server: `e0e2df9662164c61b31be009996f5df6.s1.eu.hivemq.cloud:8883`
   - Topic: `plc/data`
   - QoS: 1

### Bước 3: Function node code
```javascript
// Tạo dữ liệu PLC
const level = Math.floor(Math.random() * 80) + 20;
const pressure = (Math.random() * 3 + 0.5).toFixed(1);

msg.payload = {
    Sensors_Level: level,
    Sensors_Level_Per: level,
    Sensors_Pressure: parseFloat(pressure),
    Sensors_Pressure_Per: Math.floor(pressure / 4 * 100),
    Running_Pump: level < 40 ? 1 : 0,
    Valve_Solenoid: level < 60 ? 1 : 0,
    Auto_Mode: true,
    Manu_Mode: false,
    Emergency: false,
    timestamp: new Date().toISOString()
};

return msg;
```

## 🔧 Cách 4: Sử dụng MQTT Client Tools

### MQTT Explorer (GUI)
1. Download: http://mqtt-explorer.com/
2. Connect đến broker HiveMQ Cloud
3. Publish manual đến topic `plc/data`

### Mosquitto CLI
```bash
# Install mosquitto-clients
sudo apt-get install mosquitto-clients

# Publish test data
mosquitto_pub -h e0e2df9662164c61b31be009996f5df6.s1.eu.hivemq.cloud \
  -p 8883 \
  -u your_username \
  -P your_password \
  --capath /etc/ssl/certs/ \
  -t plc/data \
  -m '{"Sensors_Level":50,"Sensors_Pressure":2.0,"Running_Pump":1,"timestamp":"2024-01-01T00:00:00Z"}'
```

## 📊 Format Dữ Liệu Cần Thiết

Railway app mong đợi dữ liệu JSON với format:

```json
{
  "Sensors_Level": 45,
  "Sensors_Level_Per": 45,
  "Sensors_Pressure": 2.1,
  "Sensors_Pressure_Per": 52,
  "Value_Vollt_Actual": 11.2,
  "Running_Pump": 1,
  "Valve_Solenoid": 0,
  "Auto_Mode": true,
  "Manu_Mode": false,
  "Emergency": false,
  "Stt_Start_Light_Green": 1,
  "Stt_Stop_Light_Red": 0,
  "Stt_EMG_Light_yellow": 0,
  "Level_Setpoint": 60,
  "Pressure_Setpoint": 2.5,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Troubleshooting

### Lỗi kết nối MQTT
- Kiểm tra username/password HiveMQ Cloud
- Đảm bảo sử dụng port 8883 (SSL)
- Kiểm tra firewall/network

### Railway không nhận dữ liệu
- Kiểm tra topic name chính xác: `plc/data`
- Đảm bảo JSON format đúng
- Kiểm tra logs Railway để xem có nhận được message không

### Publisher không gửi được
- Kiểm tra credentials
- Test với MQTT Explorer trước
- Kiểm tra network connectivity

## ✅ Khuyến nghị

**Cho development/demo**: Sử dụng **Cách 1** (MQTT Test Publisher local)
**Cho production**: Sử dụng **Cách 2** (Deploy publisher lên Railway)
**Cho testing**: Sử dụng **Cách 4** (MQTT tools)

Cách đơn giản nhất là chạy `mqtt-test-publisher.js` từ máy local với credentials đúng!
