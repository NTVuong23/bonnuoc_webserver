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
  const mqttUseSSL = process.env.MQTT_USE_SSL === 'true';

  const mqttUrl = `${mqttUseSSL ? 'mqtts' : 'mqtt'}://${mqttHost}:${mqttPort}`;

  const mqttOptions = {
    username: mqttUsername,
    password: mqttPassword,
    rejectUnauthorized: false,
    clientId: `bonnuoc_web_${Math.random().toString(16).slice(2, 8)}`
  };

  mqttClient = mqtt.connect(mqttUrl, mqttOptions);

  mqttClient.on('connect', () => {
    console.log('Đã kết nối đến MQTT Broker');
    mqttClient.subscribe('plc/data', { qos: 1 });
    mqttClient.subscribe('plc/alarms', { qos: 1 });
  });

  mqttClient.on('error', (error) => {
    console.error('Lỗi kết nối MQTT:', error);
  });

  mqttClient.on('message', handleMQTTMessage);
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
      } else {
        console.log('Chưa có kết nối Socket.IO');
      }
    }
  } catch (error) {
    console.error('Lỗi xử lý dữ liệu MQTT:', error);
  }
}

// Gửi lệnh điều khiển
function sendCommand(command, value) {
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish('plc/commands', JSON.stringify({
      command: command,
      value: value
    }), { qos: 1 });
    return true;
  }
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
