const mqtt = require('mqtt');

// Cấu hình MQTT - match với Railway app hiện tại
const mqttHost = 'd1e16dbebd9543efaa10c0b64795eca0.s1.eu.hivemq.cloud';
const mqttPort = '8883';
const mqttUsername = 'plc_gateway'; // HiveMQ Cloud username đúng
const mqttPassword = 'Abc12345@'; // HiveMQ Cloud password

const mqttUrl = `mqtts://${mqttHost}:${mqttPort}`;

console.log('🔗 Kết nối đến MQTT broker:', mqttUrl);

const mqttOptions = {
  username: mqttUsername,
  password: mqttPassword,
  rejectUnauthorized: false,
  clientId: `plc_data_publisher_${Math.random().toString(16).slice(2, 8)}`,
  connectTimeout: 10000,
  reconnectPeriod: 5000,
  keepalive: 60,
  clean: true
};

console.log('🔐 MQTT Options:', {
  host: mqttHost,
  port: mqttPort,
  username: mqttUsername,
  password: '***',
  ssl: true
});

const client = mqtt.connect(mqttUrl, mqttOptions);

let publishInterval;
let step = 0;

// Hàm tạo dữ liệu PLC giả lập thực tế
function generatePLCData() {
  step++;
  
  // Tạo dữ liệu theo chu kỳ thực tế của hệ thống bồn nước
  const time = step * 3; // Mỗi 3 giây
  
  // Mức nước dao động từ 20% đến 80% theo chu kỳ
  const level = Math.floor(50 + 30 * Math.sin(time / 120)); // Chu kỳ 4 phút
  
  // Áp suất phụ thuộc vào mức nước và có một chút ngẫu nhiên
  const pressure = Number((1.0 + (level / 100) * 2.0 + Math.random() * 0.5).toFixed(1));
  const pressurePer = Math.floor(pressure / 4 * 100);
  
  // Logic điều khiển tự động
  const runningPump = (level < 40 || pressure < 1.5) ? 1 : 0;
  const valveSolenoid = level < 60 ? 1 : 0;
  
  // Trạng thái hệ thống
  const autoMode = Math.random() > 0.1; // 90% thời gian ở auto mode
  const emergency = Math.random() < 0.02; // 2% cơ hội emergency
  
  const plcData = {
    // Dữ liệu cảm biến
    Sensors_Level: level,
    Sensors_Level_Per: level,
    Sensors_Pressure: pressure,
    Sensors_Pressure_Per: pressurePer,
    
    // Dữ liệu điều khiển
    Running_Pump: emergency ? 0 : runningPump,
    Valve_Solenoid: emergency ? 0 : valveSolenoid,
    
    // Trạng thái hệ thống
    Auto_Mode: autoMode,
    Manu_Mode: !autoMode,
    Emergency: emergency,
    
    // Đèn báo
    Stt_Start_Light_Green: emergency ? 0 : runningPump,
    Stt_Stop_Light_Red: emergency ? 1 : (runningPump ? 0 : 1),
    Stt_EMG_Light_yellow: emergency ? 1 : 0,
    
    // Điện áp bơm
    Value_Vollt_Actual: (emergency || !runningPump) ? 0 : Number((8 + pressure * 1.5).toFixed(1)),
    
    // Setpoints
    Level_Setpoint: 60,
    Pressure_Setpoint: 2.5,
    
    // Timestamp
    timestamp: new Date().toISOString()
  };
  
  return plcData;
}

// Hàm publish dữ liệu
function publishData() {
  const data = generatePLCData();
  
  const payload = JSON.stringify(data);
  
  client.publish('plc/data', payload, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Lỗi publish dữ liệu:', err);
    } else {
      console.log(`📤 Published Step ${step}: Level=${data.Sensors_Level}%, Pressure=${data.Sensors_Pressure}bar, Pump=${data.Running_Pump}`);
    }
  });
  
  // Thỉnh thoảng gửi alarm
  if (Math.random() < 0.1) { // 10% cơ hội có alarm
    const alarmData = {
      type: 'alarm',
      level: data.Sensors_Level > 85 ? 'HIGH_LEVEL' : (data.Sensors_Level < 20 ? 'LOW_LEVEL' : 'PRESSURE_ALARM'),
      value: data.Sensors_Level > 85 ? data.Sensors_Level : data.Sensors_Pressure,
      timestamp: new Date().toISOString()
    };
    
    client.publish('plc/alarms', JSON.stringify(alarmData), { qos: 1 }, (err) => {
      if (!err) {
        console.log(`🚨 Published alarm: ${alarmData.level}`);
      }
    });
  }
}

client.on('connect', () => {
  console.log('✅ Đã kết nối đến MQTT Broker thành công!');
  console.log('📡 Bắt đầu publish dữ liệu PLC đến topic plc/data...');
  
  // Publish dữ liệu mỗi 3 giây
  publishInterval = setInterval(publishData, 3000);
  
  // Publish dữ liệu đầu tiên ngay lập tức
  publishData();
});

client.on('error', (error) => {
  console.error('❌ Lỗi kết nối MQTT:', error);
});

client.on('offline', () => {
  console.log('⚠️ MQTT client offline');
});

client.on('reconnect', () => {
  console.log('🔄 Đang reconnect MQTT...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Đang dừng MQTT publisher...');
  if (publishInterval) {
    clearInterval(publishInterval);
  }
  client.end();
  process.exit(0);
});

console.log('🚀 MQTT Test Publisher đã khởi động!');
console.log('📋 Sẽ publish dữ liệu PLC đến topic: plc/data');
console.log('⏹️ Nhấn Ctrl+C để dừng');
