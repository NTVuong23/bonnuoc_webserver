const mqtt = require('mqtt');

// Khởi tạo đối tượng lưu trữ dữ liệu PLC
const plcData = {
  // Tags được sử dụng trong giao diện
  // Giá trị mặc định
  Sensors_Level: 0,
  Sensors_Level_Per: 0,
  Sensors_Pressure: 0,
  Sensors_Pressure_Per: 0,
  Value_Vollt_Actual: 0,
  Level_Input: 0,
  Level_Setpoint: 60, // Giá trị mặc định cho mức nước
  Pressure_Input: 0,
  Pressure_Setpoint: 0,
  Level: 0,
  Pressure: 0,
  status_Mode: 0,
  Running_Pump: 0,
  Valve_Solenoid: 0,
  Emergency: false,
  Auto_Mode: false,
  Manu_Mode: false,
  Stt_Start_Light_Green: 0,
  Stt_Stop_Light_Red: 0,
  Stt_EMG_Light_yellow: 0,
  Over_Pressure: 0,
  Lack_of_Pressure: 0,
  Over_Voltage: 0
};

let mqttClient;
let io;

// Khởi tạo MQTT
function initMQTT(socketIo) {
  io = socketIo;
  
  // Mặc định một số giá trị cho giao diện ngay khi khởi động
  plcData.Level_Setpoint = 60; // Mặc định mức nước đặt là 60%
  plcData.Level = 0; // Mức nước ban đầu
  plcData.Pressure = 0; // Áp suất ban đầu
  plcData.status_Mode = plcData.Manu_Mode ? 2 : (plcData.Auto_Mode ? 1 : 0); // Trạng thái chế độ
  
  const mqttHost = process.env.MQTT_HOST || 'e0e2df9662164c61b31be009996f5df6.s1.eu.hivemq.cloud';
  const mqttPort = process.env.MQTT_PORT || '8883';
  const mqttUsername = process.env.MQTT_USERNAME || 'plc_gateway';
  const mqttPassword = process.env.MQTT_PASSWORD || 'Abc12345@';
  const mqttUseSSL = process.env.MQTT_USE_SSL !== 'false'; // Mặc định là true

  const mqttUrl = `${mqttUseSSL ? 'mqtts' : 'mqtt'}://${mqttHost}:${mqttPort}`;
  
  console.log('Kết nối đến MQTT broker:', mqttUrl);
  console.log('Sử dụng SSL:', mqttUseSSL);

  const mqttOptions = {
    username: mqttUsername,
    password: mqttPassword,
    rejectUnauthorized: false,
    clientId: `bonnuoc_web_${Math.random().toString(16).slice(2, 8)}`,
    connectTimeout: 5000
  };

  try {
    mqttClient = mqtt.connect(mqttUrl, mqttOptions);
    
    mqttClient.on('connect', () => {
      console.log('Đã kết nối đến MQTT Broker');
      console.log('Đăng ký nhận dữ liệu từ topics: plc/data và plc/alarms');
      mqttClient.subscribe('plc/data', { qos: 1 });
      mqttClient.subscribe('plc/alarms', { qos: 1 });
      
      // Đăng ký với Node-RED gateway để bắt đầu nhận dữ liệu
      console.log('Gửi yêu cầu dữ liệu đến gateway');
      mqttClient.publish('plc/request', JSON.stringify({
        action: 'subscribe',
        clientId: mqttOptions.clientId
      }), { qos: 1 });
      
      // Gửi dữ liệu ban đầu cho client thông qua Socket.IO
      if (io) {
        console.log('Gửi dữ liệu ban đầu cho client');
        io.emit('updatedata', plcData);
        
        // Phát riêng từng giá trị để kích hoạt các handler
        for (const key in plcData) {
          if (Object.prototype.hasOwnProperty.call(plcData, key)) {
            io.emit(key, plcData[key]);
          }
        }
      }
    });
    
    mqttClient.on('reconnect', () => {
      console.log('Đang kết nối lại MQTT...');
    });

    mqttClient.on('error', (error) => {
      console.error('Lỗi kết nối MQTT:', error);
    });
    
    mqttClient.on('offline', () => {
      console.log('MQTT client bị ngắt kết nối');
    });

    mqttClient.on('message', handleMQTTMessage);
  } catch (error) {
    console.error('Lỗi khởi tạo MQTT client:', error);
  }
}

// Xử lý tin nhắn MQTT
function handleMQTTMessage(topic, message) {
  try {
    console.log(`Nhận tin nhắn từ topic ${topic}:`, message.toString());
    const data = JSON.parse(message.toString());
    
    if (topic === 'plc/data') {
      // Lưu dữ liệu gốc từ MQTT
      Object.assign(plcData, data);
      
      // Ánh xạ dữ liệu từ MQTT cho các tag của giao diện web
      
      // Mực nước: gán trực tiếp cho Level_Input và phần trăm cho Level
      if (data.Sensors_Level !== undefined) {
        plcData.Level_Input = data.Sensors_Level;
      }
      
      if (data.Sensors_Level_Per !== undefined) {
        plcData.Level = data.Sensors_Level_Per / 10; // Chuyển đổi sang % phù hợp
      }
      
      // Áp suất: gán trực tiếp cho Sensors_Pressure và Pressure_Input
      if (data.Sensors_Pressure !== undefined) {
        plcData.Pressure_Input = data.Sensors_Pressure;
      }
      
      if (data.Sensors_Pressure_Per !== undefined) {
        plcData.Pressure = data.Sensors_Pressure_Per;
      }
      
      // Trạng thái hệ thống
      if (data.Auto_Mode !== undefined) {
        plcData.stt_Auto_Mode = data.Auto_Mode ? 1 : 0;
        if (data.Auto_Mode) plcData.status_Mode = 1; // Chế độ tự động
      }
      
      if (data.Manu_Mode !== undefined) {
        plcData.stt_Manu_Mode = data.Manu_Mode ? 1 : 0;
        if (data.Manu_Mode) plcData.status_Mode = 2; // Chế độ thủ công
      }
      
      if (data.Emergency !== undefined) {
        plcData.Stt_EMG_Light_yellow = data.Emergency ? 1 : 0;
      }
      
      // Tính toán điện áp bơm dựa trên áp suất (giả lập dữ liệu)
      // Công thức: 2V + áp suất * 4V/bar, để có dải điện áp từ 2V đến 14V
      if (data.Sensors_Pressure !== undefined) {
        plcData.Value_Vollt_Actual = 2 + (data.Sensors_Pressure * 4);
        // Làm tròn đến 2 chữ số thập phân
        plcData.Value_Vollt_Actual = Math.round(plcData.Value_Vollt_Actual * 100) / 100;
      }
      
      // Giá trị mặc định cho các thông số khác nếu không có
      plcData.Running_Pump = plcData.Running_Pump || (data.Sensors_Pressure > 0.5 ? 1 : 0); // Bơm chạy nếu áp suất > 0.5 bar
      plcData.Valve_Solenoid = plcData.Valve_Solenoid || (data.Sensors_Level > 50 ? 0 : 1); // Van mở khi mực nước < 50%
      plcData.Stt_Start_Light_Green = data.Auto_Mode || (data.Sensors_Pressure > 0 ? 1 : 0); // Đèn xanh khi áp suất > 0
      plcData.Stt_Stop_Light_Red = plcData.Stt_Stop_Light_Red || (data.Emergency ? 1 : 0);
      plcData.Over_Pressure = data.Sensors_Pressure > 3 ? 1 : 0; // Quá áp suất khi > 3 bar
      plcData.Lack_of_Pressure = data.Sensors_Pressure < 0.5 ? 1 : 0; // Thiếu áp suất khi < 0.5 bar
      plcData.Over_Voltage = plcData.Value_Vollt_Actual > 12 ? 1 : 0; // Quá điện áp khi > 12V
      
      console.log('Dữ liệu PLC sau khi ánh xạ:', plcData);
      
      // Gửi dữ liệu đến client
      if (io) {
        console.log('Đang gửi dữ liệu đến client qua Socket.IO');
        io.emit('updatedata', plcData);
        
        // Phát riêng từng giá trị cụ thể để kích hoạt các handler trong FC1_Common.js
        for (const key in plcData) {
          if (Object.prototype.hasOwnProperty.call(plcData, key)) {
            console.log(`Phát sóng tag ${key}: ${plcData[key]}`);
            io.emit(key, plcData[key]);
          }
        }
      } else {
        console.log('Chưa có kết nối Socket.IO');
      }
    }
  } catch (error) {
    console.error('Lỗi xử lý dữ liệu MQTT:', error, 'Raw message:', message.toString());
  }
}

// Gửi lệnh điều khiển
function sendCommand(command, value) {
  if (mqttClient && mqttClient.connected) {
    const payload = JSON.stringify({
      command: command,
      value: value
    });
    console.log(`Gửi lệnh đến plc/commands: ${payload}`);
    mqttClient.publish('plc/commands', payload, { qos: 1 });
    return true;
  }
  console.log('Không thể gửi lệnh - MQTT không kết nối');
  return false;
}

// Lấy dữ liệu PLC hiện tại
function getCurrentData() {
  return plcData;
}

module.exports = {
  initMQTT,
  sendCommand,
  getCurrentData
};
