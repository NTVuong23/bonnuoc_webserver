console.log('🚀 Bắt đầu khởi tạo MQTT publisher...');

const mqtt = require('mqtt');

// Sử dụng public broker để test
const mqttUrl = 'mqtt://broker.emqx.io:1883';

console.log('🔗 Kết nối đến public MQTT broker:', mqttUrl);
console.log('📦 MQTT library version:', require('mqtt/package.json').version);

const client = mqtt.connect(mqttUrl, {
  clientId: `test_publisher_${Math.random().toString(16).slice(2, 8)}`,
  connectTimeout: 10000,
  clean: true
});

let step = 0;

function generateTestData() {
  step++;
  
  // Tạo dữ liệu test đơn giản
  const level = Math.floor(30 + 40 * Math.sin(step / 10)); // 30-70%
  const pressure = Number((1.0 + level / 100 * 2.0).toFixed(1)); // 1.0-3.0 bar
  
  const data = {
    Sensors_Level: level,
    Sensors_Level_Per: level,
    Sensors_Pressure: pressure,
    Sensors_Pressure_Per: Math.floor(pressure / 4 * 100),
    Running_Pump: level < 50 ? 1 : 0,
    Valve_Solenoid: level < 60 ? 1 : 0,
    Auto_Mode: true,
    Manu_Mode: false,
    Emergency: false,
    Value_Vollt_Actual: level < 50 ? Number((8 + pressure * 1.5).toFixed(1)) : 0,
    Stt_Start_Light_Green: level < 50 ? 1 : 0,
    Stt_Stop_Light_Red: level < 50 ? 0 : 1,
    Stt_EMG_Light_yellow: 0,
    Level_Setpoint: 60,
    Pressure_Setpoint: 2.5,
    timestamp: new Date().toISOString()
  };
  
  return data;
}

function publishData() {
  const data = generateTestData();
  const payload = JSON.stringify(data);
  
  client.publish('plc/data', payload, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Lỗi publish:', err);
    } else {
      console.log(`📤 Published Step ${step}: Level=${data.Sensors_Level}%, Pressure=${data.Sensors_Pressure}bar, Pump=${data.Running_Pump}`);
    }
  });
}

client.on('connect', () => {
  console.log('✅ Đã kết nối đến public MQTT broker!');
  console.log('📡 Bắt đầu publish dữ liệu test đến topic plc/data...');
  
  // Publish ngay lập tức
  publishData();
  
  // Publish mỗi 3 giây
  setInterval(publishData, 3000);
});

client.on('error', (error) => {
  console.error('❌ Lỗi kết nối:', error);
});

client.on('offline', () => {
  console.log('⚠️ MQTT offline');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Đang dừng publisher...');
  client.end();
  process.exit(0);
});

console.log('🚀 Simple MQTT Test Publisher khởi động!');
console.log('📋 Sẽ publish đến topic: plc/data');
console.log('⏹️ Nhấn Ctrl+C để dừng');
