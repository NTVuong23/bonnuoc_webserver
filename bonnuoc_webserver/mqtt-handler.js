const mqtt = require('mqtt');

// Khởi tạo đối tượng lưu trữ dữ liệu PLC
const plcData = {
  Sensors_Level: 0,
  Sensors_Pressure: 0,
  Sensors_Level_Per: 0,
  Sensors_Pressure_Per: 0,
  Emergency: false,
  Auto_Mode: false,
  Manu_Mode: false
  // Thêm các biến khác...
};

let mqttClient;
let io;

// Khởi tạo MQTT
function initMQTT(socketIo) {
  io = socketIo;
  
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
      // Cập nhật dữ liệu từ MQTT
      Object.assign(plcData, data);
      console.log('Dữ liệu PLC sau khi cập nhật:', plcData);
      
      // Gửi dữ liệu đến client
      if (io) {
        console.log('Đang gửi dữ liệu đến client qua Socket.IO');
        io.emit('updatedata', plcData);
        
        // Phát riêng các giá trị cụ thể để kích hoạt các handler trong FC1_Common.js
        Object.keys(data).forEach(key => {
          io.emit(key, data[key]);
        });
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
