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
      // Kiểm tra xem có đang ở trạng thái dừng hay khẩn cấp không
      if (plcData.Stt_Stop_Light_Red == 1 || plcData.Emergency == true) {
        console.log('Hệ thống đang ở trạng thái dừng hoặc khẩn cấp, bỏ qua cập nhật dữ liệu');
        return;
      }
      
      // Lưu trạng thái van và bơm trước khi cập nhật từ MQTT
      const prevValveState = plcData.Valve_Solenoid;
      const prevPumpState = plcData.Running_Pump;
      
      // Lưu dữ liệu gốc từ MQTT - nhưng không ghi đè lên trạng thái điều khiển trong chế độ thủ công
      if (plcData.Manu_Mode !== true) {
        // Chế độ tự động - áp dụng tất cả dữ liệu
        Object.assign(plcData, data);
      } else {
        // Chế độ thủ công - chỉ áp dụng dữ liệu cảm biến, không áp dụng dữ liệu điều khiển
        // Tạo một bản sao dữ liệu MQTT không có các thuộc tính điều khiển
        const sensorData = {...data};
        delete sensorData.Running_Pump;  // Không ghi đè trạng thái bơm trong chế độ thủ công
        delete sensorData.Valve_Solenoid; // Không ghi đè trạng thái van trong chế độ thủ công
        
        // Chỉ áp dụng dữ liệu cảm biến
        Object.assign(plcData, sensorData);
        
        // Khôi phục trạng thái điều khiển thủ công
        plcData.Valve_Solenoid = prevValveState;
        plcData.Running_Pump = prevPumpState;
      }
      
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
      
      // Trạng thái hệ thống - chỉ cập nhật chế độ nếu không ở trạng thái dừng
      if (plcData.Stt_Stop_Light_Red !== 1) {
        if (data.Auto_Mode !== undefined) {
          plcData.stt_Auto_Mode = data.Auto_Mode ? 1 : 0;
          if (data.Auto_Mode) {
            plcData.status_Mode = 1; // Chế độ tự động
            plcData.Manu_Mode = false; // Đảm bảo không ở chế độ thủ công
            plcData.stt_Manu_Mode = 0;
          }
        }
        
        if (data.Manu_Mode !== undefined) {
          plcData.stt_Manu_Mode = data.Manu_Mode ? 1 : 0;
          if (data.Manu_Mode) {
            plcData.status_Mode = 2; // Chế độ thủ công
            plcData.Auto_Mode = false; // Đảm bảo không ở chế độ tự động
            plcData.stt_Auto_Mode = 0;
          }
        }
      }
      
      if (data.Emergency !== undefined) {
        plcData.Stt_EMG_Light_yellow = data.Emergency ? 1 : 0;
        
        // Nếu có tín hiệu khẩn cấp, dừng toàn bộ hệ thống
        if (data.Emergency) {
          plcData.Running_Pump = 0;
          plcData.Valve_Solenoid = 0;
          plcData.Stt_Start_Light_Green = 0;
          plcData.Stt_Stop_Light_Red = 1;
          plcData.Value_Vollt_Actual = 0;
        }
      }
      
      // Tính toán điện áp bơm dựa trên áp suất (giả lập dữ liệu) - chỉ khi đang chạy
      if (data.Sensors_Pressure !== undefined && plcData.Running_Pump == 1 && plcData.Stt_Stop_Light_Red !== 1) {
        plcData.Value_Vollt_Actual = 2 + (data.Sensors_Pressure * 4);
        // Làm tròn đến 2 chữ số thập phân
        plcData.Value_Vollt_Actual = Math.round(plcData.Value_Vollt_Actual * 100) / 100;
      }
      
      // Giá trị mặc định cho các thông số khác nếu không có và không trong trạng thái dừng
      if (plcData.Stt_Stop_Light_Red !== 1 && plcData.Manu_Mode !== true) {
        // Chỉ áp dụng logic tự động khi không ở chế độ thủ công
        plcData.Running_Pump = plcData.Running_Pump || (data.Sensors_Pressure > 0.5 ? 1 : 0); // Bơm chạy nếu áp suất > 0.5 bar
        plcData.Valve_Solenoid = plcData.Valve_Solenoid || (data.Sensors_Level > 50 ? 0 : 1); // Van mở khi mực nước < 50%
        plcData.Stt_Start_Light_Green = data.Auto_Mode || (data.Sensors_Pressure > 0 ? 1 : 0); // Đèn xanh khi áp suất > 0
        plcData.Stt_Stop_Light_Red = plcData.Stt_Stop_Light_Red || (data.Emergency ? 1 : 0);
      }
      
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
    
    // Cập nhật trạng thái local dựa trên lệnh đã gửi
    updateLocalState(command, value);
    
    return true;
  }
  console.log('Không thể gửi lệnh - MQTT không kết nối');
  return false;
}

// Cập nhật trạng thái local dựa trên lệnh đã gửi
function updateLocalState(command, value) {
  // Cập nhật dữ liệu trong bộ nhớ local và thông báo cho client
  switch(command) {
    case 'Level_Setpoint':
      plcData.Level_Setpoint = parseFloat(value);
      if (io) io.emit('Level_Setpoint', plcData.Level_Setpoint);
      break;
    case 'btt_Auto':
      // Khi chuyển sang chế độ tự động
      plcData.Auto_Mode = value ? true : false;
      plcData.Manu_Mode = false;
      plcData.status_Mode = 1;
      plcData.stt_Auto_Mode = 1;
      plcData.stt_Manu_Mode = 0;
      
      // Khi chuyển chế độ, reset trạng thái các đèn về mặc định của chế độ đó
      if (value) {
        // Đèn start mặc định tắt khi mới chuyển sang chế độ tự động
        plcData.Stt_Start_Light_Green = 0;
        plcData.Stt_Stop_Light_Red = 1;
        plcData.Running_Pump = 0;
      }
      
      if (io) {
        io.emit('Auto_Mode', plcData.Auto_Mode);
        io.emit('Manu_Mode', plcData.Manu_Mode);
        io.emit('status_Mode', plcData.status_Mode);
        io.emit('stt_Auto_Mode', plcData.stt_Auto_Mode);
        io.emit('stt_Manu_Mode', plcData.stt_Manu_Mode);
        io.emit('Stt_Start_Light_Green', plcData.Stt_Start_Light_Green);
        io.emit('Stt_Stop_Light_Red', plcData.Stt_Stop_Light_Red);
        io.emit('Running_Pump', plcData.Running_Pump);
      }
      break;
    case 'btt_Manu':
      // Khi chuyển sang chế độ thủ công
      plcData.Manu_Mode = value ? true : false;
      plcData.Auto_Mode = false;
      plcData.status_Mode = 2;
      plcData.stt_Manu_Mode = 1;
      plcData.stt_Auto_Mode = 0;
      
      // Khi chuyển chế độ, reset trạng thái các thiết bị
      if (value) {
        // Mặc định khi chuyển sang chế độ thủ công, tất cả thiết bị đều tắt
        plcData.Running_Pump = 0;
        plcData.Valve_Solenoid = 0;
        plcData.Stt_Start_Light_Green = 0;
        plcData.Stt_Stop_Light_Red = 1;
      }
      
      if (io) {
        io.emit('Manu_Mode', plcData.Manu_Mode);
        io.emit('Auto_Mode', plcData.Auto_Mode);
        io.emit('status_Mode', plcData.status_Mode);
        io.emit('stt_Manu_Mode', plcData.stt_Manu_Mode);
        io.emit('stt_Auto_Mode', plcData.stt_Auto_Mode);
        io.emit('Running_Pump', plcData.Running_Pump);
        io.emit('Valve_Solenoid', plcData.Valve_Solenoid);
        io.emit('Stt_Start_Light_Green', plcData.Stt_Start_Light_Green);
        io.emit('Stt_Stop_Light_Red', plcData.Stt_Stop_Light_Red);
      }
      break;
    case 'Btt_Auto_Start':
      if (value) {
        plcData.Stt_Start_Light_Green = 1;
        plcData.Stt_Stop_Light_Red = 0;
        plcData.Running_Pump = 1; // Đèn start sáng thì bơm phải chạy
        if (io) {
          io.emit('Stt_Start_Light_Green', plcData.Stt_Start_Light_Green);
          io.emit('Stt_Stop_Light_Red', plcData.Stt_Stop_Light_Red);
          io.emit('Running_Pump', plcData.Running_Pump);
        }
      }
      break;
    case 'Btt_Auto_Stop':
      if (value) {
        // Dừng hoàn toàn hệ thống
        plcData.Stt_Start_Light_Green = 0;
        plcData.Stt_Stop_Light_Red = 1;
        plcData.Running_Pump = 0; // Dừng bơm
        plcData.Value_Vollt_Actual = 0; // Điện áp bơm = 0
        plcData.Sensors_Pressure = 0; // Áp suất = 0
        plcData.Sensors_Pressure_Per = 0; // % áp suất = 0
        plcData.Pressure = 0;
        plcData.Pressure_Input = 0;
        
        if (io) {
          // Gửi tất cả các trạng thái đã dừng
          io.emit('Stt_Start_Light_Green', plcData.Stt_Start_Light_Green);
          io.emit('Stt_Stop_Light_Red', plcData.Stt_Stop_Light_Red);
          io.emit('Running_Pump', plcData.Running_Pump);
          io.emit('Value_Vollt_Actual', plcData.Value_Vollt_Actual);
          io.emit('Sensors_Pressure', plcData.Sensors_Pressure);
          io.emit('Sensors_Pressure_Per', plcData.Sensors_Pressure_Per);
          io.emit('Pressure', plcData.Pressure);
          io.emit('Pressure_Input', plcData.Pressure_Input);
        }
      }
      break;
    case 'Btt_Emergency':
      plcData.Emergency = value ? true : false;
      plcData.Stt_EMG_Light_yellow = value ? 1 : 0;
      
      // Nếu là khẩn cấp, dừng toàn bộ hệ thống
      if (value) {
        plcData.Running_Pump = 0;
        plcData.Valve_Solenoid = 0;
        plcData.Stt_Start_Light_Green = 0;
        plcData.Stt_Stop_Light_Red = 1;
        plcData.Value_Vollt_Actual = 0;
        plcData.Sensors_Pressure = 0;
        plcData.Sensors_Pressure_Per = 0;
        plcData.Pressure = 0;
        plcData.Pressure_Input = 0;
      }
      
      if (io) {
        io.emit('Emergency', plcData.Emergency);
        io.emit('Stt_EMG_Light_yellow', plcData.Stt_EMG_Light_yellow);
        io.emit('Running_Pump', plcData.Running_Pump);
        io.emit('Valve_Solenoid', plcData.Valve_Solenoid);
        io.emit('Stt_Start_Light_Green', plcData.Stt_Start_Light_Green);
        io.emit('Stt_Stop_Light_Red', plcData.Stt_Stop_Light_Red);
        io.emit('Value_Vollt_Actual', plcData.Value_Vollt_Actual);
        io.emit('Sensors_Pressure', plcData.Sensors_Pressure);
        io.emit('Sensors_Pressure_Per', plcData.Sensors_Pressure_Per);
        io.emit('Pressure', plcData.Pressure);
        io.emit('Pressure_Input', plcData.Pressure_Input);
      }
      break;
    case 'btt_Valve_Open':
      // Trong chế độ thủ công, van phải luôn đáp ứng theo lệnh
      if (value) {
        plcData.Valve_Solenoid = 1;
        if (io) io.emit('Valve_Solenoid', plcData.Valve_Solenoid);
        console.log('Đã mở van: Valve_Solenoid =', plcData.Valve_Solenoid);
      }
      break;
    case 'btt_Valve_Close':
      // Trong chế độ thủ công, van phải luôn đáp ứng theo lệnh
      if (value) {
        plcData.Valve_Solenoid = 0;
        if (io) io.emit('Valve_Solenoid', plcData.Valve_Solenoid);
        console.log('Đã đóng van: Valve_Solenoid =', plcData.Valve_Solenoid);
      }
      break;
    case 'btt_Pump_Run':
      // Trong chế độ thủ công, bơm phải luôn đáp ứng theo lệnh
      if (value) {
        plcData.Running_Pump = 1;
        plcData.Stt_Start_Light_Green = 1;
        plcData.Stt_Stop_Light_Red = 0;
        
        // Khi bơm chạy, cần mô phỏng áp suất tăng
        if (plcData.Manu_Mode) {
          setTimeout(() => {
            if (plcData.Running_Pump === 1) {
              plcData.Sensors_Pressure = 2;  // Mô phỏng áp suất 2 bar
              plcData.Sensors_Pressure_Per = 40; // 40%
              plcData.Pressure = 40;
              plcData.Pressure_Input = 2;
              plcData.Value_Vollt_Actual = 10; // Điện áp bơm
              
              if (io) {
                io.emit('Sensors_Pressure', plcData.Sensors_Pressure);
                io.emit('Sensors_Pressure_Per', plcData.Sensors_Pressure_Per);
                io.emit('Pressure', plcData.Pressure);
                io.emit('Pressure_Input', plcData.Pressure_Input);
                io.emit('Value_Vollt_Actual', plcData.Value_Vollt_Actual);
              }
            }
          }, 1000); // Sau 1 giây, áp suất tăng lên
        }
        
        if (io) {
          io.emit('Running_Pump', plcData.Running_Pump);
          io.emit('Stt_Start_Light_Green', plcData.Stt_Start_Light_Green);
          io.emit('Stt_Stop_Light_Red', plcData.Stt_Stop_Light_Red);
          console.log('Đã bật bơm: Running_Pump =', plcData.Running_Pump);
        }
      }
      break;
    case 'btt_Pump_Stop':
      // Trong chế độ thủ công, bơm phải luôn đáp ứng theo lệnh
      if (value) {
        // Dừng bơm và các thông số liên quan
        plcData.Running_Pump = 0;
        plcData.Stt_Start_Light_Green = 0;
        plcData.Stt_Stop_Light_Red = 1;
        plcData.Value_Vollt_Actual = 0;
        plcData.Sensors_Pressure = 0;
        plcData.Sensors_Pressure_Per = 0;
        plcData.Pressure = 0;
        plcData.Pressure_Input = 0;
        
        if (io) {
          io.emit('Running_Pump', plcData.Running_Pump);
          io.emit('Stt_Start_Light_Green', plcData.Stt_Start_Light_Green);
          io.emit('Stt_Stop_Light_Red', plcData.Stt_Stop_Light_Red);
          io.emit('Value_Vollt_Actual', plcData.Value_Vollt_Actual);
          io.emit('Sensors_Pressure', plcData.Sensors_Pressure);
          io.emit('Sensors_Pressure_Per', plcData.Sensors_Pressure_Per);
          io.emit('Pressure', plcData.Pressure);
          io.emit('Pressure_Input', plcData.Pressure_Input);
          console.log('Đã dừng bơm: Running_Pump =', plcData.Running_Pump);
        }
      }
      break;
    default:
      // Không xử lý các lệnh khác
      break;
  }
  
  // Cập nhật dữ liệu tổng cho client
  if (io) io.emit('updatedata', plcData);
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
