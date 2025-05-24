// Thêm hỗ trợ dotenv
try {
  require('dotenv').config(); // Tải biến môi trường từ file .env nếu có
} catch (err) {
  console.log('Không tìm thấy module dotenv hoặc file .env. Sử dụng giá trị mặc định.');
}

// triger ghi dữ liệu cảnh báo vào SQL
var Alarm_ID1 = false;			// Trigger Alarm add ID1
var Alarm_ID2 = false;			// Trigger Alarm add ID2
var Alarm_ID3 = false;	
var Alarm_ID4 = false;			// Trigger Alarm add ID3
var Alarm_ID5 = false;			// Trigger Alarm add ID3


var Alarm_ID1_old = false;		// Trigger alarm old ID1
var Alarm_ID2_old = false;		// Trigger alarm old ID2
var Alarm_ID3_old = false;	
var Alarm_ID4_old = false;		// Trigger alarm old ID3
var Alarm_ID5_old = false;		// Trigger alarm old ID3
// Mảng xuất dữ liệu report Excel
var SQL_Excel_Alarm = [];
//const dayjs=require('dayjs'); //Thư viện xử lý ngày giờ dễ dùng
// KHỞI TẠO KẾT NỐI PLC
var nodes7 = require('nodes7');
var conn_plc = new nodes7; //PLC1
// Tạo địa chỉ kết nối (slot = 2 nếu là 300/400, slot = 1 nếu là 1200/1500)

// Sử dụng biến môi trường hoặc giá trị mặc định
conn_plc.initiateConnection({
  port: process.env.PLC_PORT || 102, 
  host: process.env.PLC_HOST || '192.168.0.1', 
  rack: parseInt(process.env.PLC_RACK || 0), 
  slot: parseInt(process.env.PLC_SLOT || 1),
  timeout: 5000 // Thêm timeout để không chờ quá lâu
}, PLC_connected);

// Flag theo dõi trạng thái kết nối PLC
let plcConnected = false;

// Bảng tag trong Visual studio code
var tags_list = { 
    In_Pressure_Value: 'IW66',
    In_Level_Value: 'IW64',
    Valve_Solenoid:'Q0.0',
    Out_motor:'QW66',
    Btt_Auto_Start: 'DB4,X0.0',                
    Btt_Auto_Stop: 'DB4,X0.1',          
    btt_Auto: 'DB4,X0.2',      
    btt_Manu: 'DB4,X0.3',    
    Manu_Mode: 'DB4,X0.4',    
    Auto_Mode: 'DB4,X0.5',    
    stt_Auto_Mode: 'DB4,X0.6',    
    stt_Manu_Mode: 'DB4,X0.7',    
    M_Manu: 'DB4,X1.0',  
    Btt_Emergency: 'DB4,X1.1',      
    Emergency: 'DB4,X1.2',
    btt_Valve_Open: 'DB4,X1.3',
    btt_Valve_Close: 'DB4,X1.4',
    btt_Reset: 'DB4,X1.5',
    Reset_Value_Setpoint: 'DB4,X1.6',
    Reset_Parameter_PID: 'DB4,X1.7',
    Reset: 'DB4,X2.0',
    Reset_PID: 'DB4,X2.1',             
    btt_Pump_Run: 'DB4,X2.2',
    btt_Pump_Stop: 'DB4,X2.3',
    Enable_Auto_Mode_Systems: 'DB4,X2.4',    
    Run_PID: 'DB4,X2.5',
    Level:'DB4,X2.6',
    Pressure:'DB4,X2.7',
    Flashing_HMI:'DB4,X3.0',
    status_Mode: 'DB4,BYTE4',
    Value_Vollt_Actual: 'DB4,REAL6',
    ///////////////////EDN DB4////////////////
    Level_Setpoint: 'DB2,REAL0', 
    Level_Input: 'DB2,REAL4', 
    Level_Output: 'DB2,REAL8', 
    Pressure_Setpoint: 'DB2,REAL12', 
    Pressure_Input: 'DB2,REAL16', 
    Pressure_Output: 'DB2,REAL20', 
    Sensors_Pressure: 'DB2,REAL24', 
    Sensors_Level: 'DB2,REAL28', 
    Sensors_Pressure_Per: 'DB2,REAL32', 
    Sensors_Level_Per: 'DB2,REAL36', 
    After_Setpoint_Pressure: 'DB2,REAL40', 
    After_Setpoint_Pressure_HMI: 'DB2,REAL44',  
    Gain_Level: 'DB2,REAL64',
    Ti_Level: 'DB2,REAL68', 
    Td_Level: 'DB2,REAL72',
    TdFiltRatio_Level: 'DB2,REAL76', 
    PWeighting_Level: 'DB2,REAL80', 
    DWeighting_Level: 'DB2,REAL84',
    Cycle_Level: 'DB2,REAL88',
    Gain_Pressure: 'DB2,REAL92',
    Ti_Pressure: 'DB2,REAL96', 
    Td_Pressure: 'DB2,REAL100',
    TdFiltRatio_Pressure: 'DB2,REAL104', 
    PWeighting_Pressure: 'DB2,REAL108', 
    DWeighting_Pressure: 'DB2,REAL112',
    Cycle_Pressure: 'DB2,REAL116',
    ////////////////////////
    Gain_Level_Retain: 'DB2,REAL120',
    Ti_Level_Retain: 'DB2,REAL124', 
    Td_Level_Retain: 'DB2,REAL128',
    TdFiltRatio_Level_Retain: 'DB2,REAL132', 
    PWeighting_Level_Retain: 'DB2,REAL136', 
    DWeighting_Level_Retain: 'DB2,REAL140',
    Cycle_Level_Retain: 'DB2,REAL144',
    Gain_Pressure_Retain: 'DB2,REAL148',
    Ti_Pressure_Retain: 'DB2,REAL152', 
    Td_Pressure_Retain: 'DB2,REAL156',
    TdFiltRatio_Pressure_Retain: 'DB2,REAL160', 
    PWeighting_Pressure_Retain: 'DB2,REAL164', 
    DWeighting_Pressure_Retain: 'DB2,REAL168',
    Cycle_Pressure_Retain: 'DB2,REAL172',
    //////////////END DB2/////////////
    Lack_of_Pressure: 'DB1,X0.0',
    Over_Voltage: 'DB1,X0.1',
    Over_Pressure: 'DB1,X0.2',
    Stt_Start_Light_Green: 'DB1,X0.3', 
    Stt_Stop_Light_Red: 'DB1,X0.4', 
    Stt_EMG_Light_yellow: 'DB1,X0.5',
    Running_Pump: 'DB1,X0.6',
    High_Level: 'DB1,X0.7',
    Low_Level: 'DB1,X1.0',
    Q_Valve: 'DB1,X1.1',
    M_Valve: 'DB1,X1.2', 
    Alarm_1: 'DB1,REAL2', 
    Alarm_2: 'DB1,REAL6',
    Alarm_3: 'DB1,REAL10',
    Alarm_4: 'DB1,REAL14'


};

// GỬI DỮ LIỆu TAG CHO PLC
function PLC_connected(err) {
    if (typeof(err) !== "undefined") {
        console.log("Lỗi kết nối PLC:", err);
        console.log("Chuyển sang chế độ chỉ sử dụng MQTT");
        plcConnected = false;
    } else {
        console.log("Đã kết nối thành công với PLC");
        plcConnected = true;
    }
    
    // Vẫn tiếp tục thiết lập tags để sẵn sàng khi PLC kết nối lại
    conn_plc.setTranslationCB(function(tag) {return tags_list[tag];});  // Đưa giá trị đọc lên từ PLC và mảng
    
    conn_plc.addItems([
    'In_Pressure_Value',
      'In_Level_Value',       
      'Valve_Solenoid',       
      'Out_motor', 
      'Btt_Auto_Start',
      'Btt_Auto_Stop',       
      'btt_Auto',       
      'btt_Manu',       
      'Manu_Mode',       
      'Auto_Mode',       
      'stt_Auto_Mode',       
      'stt_Manu_Mode',       
      'M_Manu',       
      'Btt_Emergency',       
      'Emergency',       
      'btt_Valve_Open',   
      'btt_Valve_Close',
      'btt_Reset',       
      'Reset_Value_Setpoint',       
      'Reset_Parameter_PID',       
      'Reset',       
      'Reset_PID',       
      'btt_Pump_Run',       
      'btt_Pump_Stop',       
      'Enable_Auto_Mode_Systems',       
      'Run_PID',       
      'status_Mode',       
      'Level',  
      'Pressure',       
      'Level_Setpoint',       
      'Level_Input',       
      'Level_Output',       
      'Pressure_Setpoint',       
      'Pressure_Input',       
      'Pressure_Output',       
      'Sensors_Pressure',       
      'Sensors_Level',       
      'Sensors_Pressure_Per',       
      'Sensors_Level_Per',  
      'After_Setpoint_Pressure',       
      'After_Setpoint_Pressure_HMI',       
      'Gain_Level',       
      'Ti_Level',       
      'Td_Level',       
      'TdFiltRatio_Level',       
      'PWeighting_Level',       
      'DWeighting_Level',       
      'Cycle_Level',       
      'Gain_Pressure',       
      'Ti_Pressure',   
      'Td_Pressure',       
      'TdFiltRatio_Pressure',       
      'PWeighting_Pressure',       
      'DWeighting_Pressure',       
      'Cycle_Pressure',  
      'Gain_Level_Retain',    
      'Ti_Level_Retain', 
      'Td_Level_Retain', 
      'TdFiltRatio_Level_Retain', 
      'PWeighting_Level_Retain', 
      'DWeighting_Level_Retain', 
      'Cycle_Level_Retain',  
      'Gain_Pressure_Retain',    
      'Ti_Pressure_Retain', 
      'Td_Pressure_Retain', 
      'TdFiltRatio_Pressure_Retain', 
      'PWeighting_Pressure_Retain', 
      'DWeighting_Pressure_Retain', 
      'Cycle_Pressure_Retain', 
      'Value_Vollt_Actual',       
      'Lack_of_Pressure',       
      'Over_Voltage',       
      'Over_Pressure', 
      'Stt_Start_Light_Green',       
      'Stt_Stop_Light_Red',       
      'Stt_EMG_Light_yellow',       
      'Running_Pump',       
      'High_Level',       
      'Low_Level',       
      'Q_Valve',       
      'M_Valve',       
      'Alarm_1', 
      'Alarm_2',       
      'Alarm_3',       
      'Alarm_4'       
    ]);  
}
// Đọc dữ liệu từ PLC và đưa vào array tags
var arr_tag_value; // Tạo một mảng lấy tên tag sau khi đọc về giá trị
var tag_Obj={};// Danh sách lưu tên tag và giá trị tag tương ứng, vì khi đọc về
//khả năng là thứ tự tag lộn xộn do các tag trong DB ko xếp theo thứ tự
//nên thư viện nodes7 tự optimize theo thứ tự tăng dần 
//nên sẽ sai thứ tự so với DB
function valuesReady(anythingBad, values) {
    if (anythingBad) { console.log("Lỗi khi đọc dữ liệu tag"); } // Cảnh báo lỗi
    var lodash = require('lodash'); // Chuyển variable sang array
    tagArr = lodash.map(values, (item) => item);
    arr_tag_value = lodash.keys(values);
    tag_Obj=values;
    
    //console.log([dayjs().format('YYYY-MM-DD HH:mm:ss'),'Alarm_1',tag_Obj['Alarm_1']]);//chỉ hiện 1 tag
    console.log(tag_Obj);//hiển thị tất cả
}
// Hàm chức năng scan giá trị
function fn_read_data_scan(){
    try {
        if (plcConnected) {
            // Chỉ đọc dữ liệu từ PLC nếu đã kết nối
            conn_plc.readAllItems(valuesReady);
        } else {
            console.log("Bỏ qua đọc PLC do không có kết nối");
        }
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu PLC:", error);
        plcConnected = false;
    }
    
    // Vẫn xử lý alarm dựa trên dữ liệu đã có (từ MQTT hoặc PLC)
    fn_Alarm_Manage();
}
// Time cập nhật mỗi 1s
setInterval(
    () => fn_read_data_scan(),
    1000 // 1s = 1000ms // doc cham de de tim loi
);
// /////////////////////////++THIẾT LẬP KẾT NỐI WEB++/////////////////////////
const express = require('express');
const app = express();
const http = require('http').createServer(app);
// Thêm cấu hình CORS cho Socket.IO
const io = require('socket.io')(http, {
  cors: {
    origin: "*", // Cho phép tất cả các origin
    methods: ["GET", "POST"]
  }
});
const mqttHandler = require('./mqtt-handler');
const path = require('path');

// Cấu hình view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cấu hình để phục vụ tệp tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Khởi tạo MQTT và truyền đối tượng io vào
mqttHandler.initMQTT(io);

// Thiết lập Socket.IO
io.on('connection', function(socket) {
  console.log('Có client kết nối, ID:', socket.id);
  
  // Gửi dữ liệu hiện tại khi client kết nối
  const currentData = mqttHandler.getCurrentData();
  console.log('Dữ liệu hiện tại gửi cho client:', currentData);
  socket.emit('updatedata', currentData);

  // Xử lý lệnh từ client
  socket.on('Level_Setpoint', function(data) {
    console.log('Nhận lệnh Level_Setpoint:', data);
    mqttHandler.sendCommand('Level_Setpoint', data);
  });
  
  socket.on('Pressure_Setpoint', function(data) {
    console.log('Nhận lệnh Pressure_Setpoint:', data);
    mqttHandler.sendCommand('Pressure_Setpoint', data);
  });
  
  // Thêm sự kiện ngắt kết nối để log
  socket.on('disconnect', function() {
    console.log('Client ngắt kết nối, ID:', socket.id);
  });
  
  // Các sự kiện khác...
});

// Sử dụng PORT từ biến môi trường hoặc mặc định 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
// Home calling
app.get("/", function(req, res){
    res.render("home")
});
//
// ///////////LẬP BẢNG TAG ĐỂ GỬI QUA CLIENT (TRÌNH DUYỆT)///////////
function fn_tag(){
    Object.entries(tag_Obj).forEach(entry => {
        const [key, value] = entry;
        //console.log(key, value);
        io.sockets.emit(key, value);
    });
}

// /////////// GỬI DỮ LIỆU BẢNG TAG ĐẾN CLIENT (TRÌNH DUYỆT) ///////////////
io.on("connection", function(socket){
    console.log('Client mới kết nối:', socket.id);
    
    // Gửi dữ liệu ngay khi client kết nối
    fn_tag();
    
    socket.on("Client-send-data", function(data){
        console.log('Nhận yêu cầu dữ liệu từ client:', socket.id, data);
        fn_tag(); 
        fn_Alarm_Show();
        fn_Alarm_Search_ByTime();
        fn_Require_ExcelExport_Alarm();
    });
});
// HÀM GHI DỮ LIỆU XUỐNG PLC
function valuesWritten(anythingBad) {
    if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
    console.log("Done writing.");
}

// ///////////DỮ LIỆU NÚT NHẤN ĐIỀU KHIỂN ///////////
io.on("connection", function(socket){
    // ///////////MÀN CHẾ ĐỘ TỰ ĐỘNG ///////////
    // Nút nhấn chế độ tự động
    socket.on("cmd_Auto", function(data){
        // Ưu tiên gửi lệnh qua MQTT 
        if (mqttHandler) {
            console.log('Gửi lệnh Auto qua MQTT:', data);
            mqttHandler.sendCommand('btt_Auto', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('btt_Auto', data, valuesWritten);
        }
    });
    
    // Nút nhấn chế độ bằng tay
    socket.on("cmd_Manu", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh Manu qua MQTT:', data);
            mqttHandler.sendCommand('btt_Manu', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('btt_Manu', data, valuesWritten);
        }
    });
    
    // Nút nhấn chạy hệ thống chế độ tự động
    socket.on("cmd_Start", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh Start qua MQTT:', data);
            mqttHandler.sendCommand('Btt_Auto_Start', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('Btt_Auto_Start', data, valuesWritten);
        }
    });
    
    // Nút nhấn dừng hệ thống chế độ tự động
    socket.on("cmd_Stop", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh Stop qua MQTT:', data);
            mqttHandler.sendCommand('Btt_Auto_Stop', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('Btt_Auto_Stop', data, valuesWritten);
        }
    });
    
    // Nút nhấn khẩn cấp
    socket.on("cmd_EMG", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh Emergency qua MQTT:', data);
            mqttHandler.sendCommand('Btt_Emergency', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('Btt_Emergency', data, valuesWritten);
        }
    });
    
    // ///////////MÀN CHẾ ĐỘ BẰNG TAY ///////////
    // Mở van 
    socket.on("cmd_OpenV", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh OpenV qua MQTT:', data);
            mqttHandler.sendCommand('btt_Valve_Open', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('btt_Valve_Open', data, valuesWritten);
        }
    });
    
    // Đóng van 
    socket.on("cmd_CloseV", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh CloseV qua MQTT:', data);
            mqttHandler.sendCommand('btt_Valve_Close', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('btt_Valve_Close', data, valuesWritten);
        }
    });
    
    // Chạy Pump
    socket.on("cmd_RunP", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh RunP qua MQTT:', data);
            mqttHandler.sendCommand('btt_Pump_Run', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('btt_Pump_Run', data, valuesWritten);
        }
    });
    
    // Dừng Pump
    socket.on("cmd_StopP", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Gửi lệnh StopP qua MQTT:', data);
            mqttHandler.sendCommand('btt_Pump_Stop', data);
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('btt_Pump_Stop', data, valuesWritten);
        }
    });

    // Ghi dữ liệu từ IO field setpoint
    socket.on("cmd_Edit_Data", function(data){
        // Ưu tiên gửi lệnh qua MQTT
        if (mqttHandler) {
            console.log('Cập nhật Level_Setpoint qua MQTT:', data);
            // Cập nhật giá trị trong bộ nhớ local
            mqttHandler.getCurrentData().Level_Setpoint = parseFloat(data);
            // Gửi lệnh qua MQTT
            mqttHandler.sendCommand('Level_Setpoint', parseFloat(data));
            
            // Phát sóng ngay lập tức cho tất cả client để cập nhật giao diện
            io.emit('Level_Setpoint', parseFloat(data));
        }
        
        // Gửi lệnh đến PLC nếu có kết nối
        if (plcConnected) {
            conn_plc.writeItems('Level_Setpoint', data, valuesWritten);
        }
    });

    // Ghi dữ liệu từ IO field PID
    socket.on("cmd_Edit_Data_PID", function(data){
        conn_plc.writeItems(['Gain_Level','Ti_Level','Td_Level','TdFiltRatio_Level','PWeighting_Level','DWeighting_Level','Cycle_Level',
                            'Gain_Pressure','Ti_Pressure','Td_Pressure','TdFiltRatio_Pressure','PWeighting_Pressure','DWeighting_Pressure','Cycle_Pressure'],
                            [data[0],data[1],data[2],data[3],data[4],data[5],data[6],
                            data[7],data[8],data[9],data[10],data[10],data[11],data[12]
                        ], valuesWritten);  
        });
});

// /////////// CƠ SỞ DỮ LIỆU SQL ///////////////
// Khởi tạo SQL
var mysql = require('mysql2');

// Thêm đoạn này vào đầu file index.js
try {
  console.log("==== THÔNG TIN KẾT NỐI DATABASE ====");
  console.log("Database Host:", process.env.MYSQLHOST || "localhost");
  console.log("Database Name:", process.env.MYSQL_DATABASE || "SQL_PLC");
  console.log("Database User:", process.env.MYSQLUSER || "root");
  console.log("Database Port:", process.env.MYSQLPORT || "3306");
  // Debug thông tin mật khẩu (chỉ hiển thị có/không)
  console.log("Password available:", process.env.MYSQL_ROOT_PASSWORD ? "Yes" : "No");
  console.log("=====================================");
} catch (e) {
  console.error("Lỗi khi hiển thị thông tin kết nối:", e);
}

// Sử dụng chính xác tên các biến môi trường từ Railway
var sqlcon = mysql.createConnection({
    host: process.env.MYSQLHOST || "mysql-az0h.railway.internal",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQL_ROOT_PASSWORD || "WWfgEeUnoxLQlPlBzdgrTOuyueZrINGg", // Sử dụng MYSQL_ROOT_PASSWORD
    database: process.env.MYSQL_DATABASE || "railway",
    port: parseInt(process.env.MYSQLPORT || "3306"),
    dateStrings: true
});

// Kiểm tra và tạo bảng alarm nếu chưa tồn tại
function setupDatabase() {
  sqlcon.query("SHOW TABLES LIKE 'alarm'", function(err, results) {
    if (err) {
      console.error("Lỗi kiểm tra bảng alarm:", err);
      return;
    }
    
    if (results.length === 0) {
      // Bảng không tồn tại, tạo mới
      console.log("Tạo bảng alarm...");
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS alarm (
          date_time DATETIME,
          ID VARCHAR(50),
          Status VARCHAR(10),
          AlarmName VARCHAR(255)
        )
      `;
      
      sqlcon.query(createTableSQL, function(err) {
        if (err) {
          console.error("Lỗi tạo bảng alarm:", err);
        } else {
          console.log("Đã tạo bảng alarm thành công!");
        }
      });
    } else {
      console.log("Bảng alarm đã tồn tại!");
    }
  });
}

// Thêm đoạn này ngay sau khi kết nối MySQL thành công
sqlcon.connect(function(err) {
  if (err) {
    console.error('Lỗi kết nối đến MySQL:', err);
    console.log('Chi tiết lỗi:', err.message);
    console.log('Tiếp tục chạy ứng dụng mà không có cơ sở dữ liệu...');
  } else {
    console.log("Kết nối MySQL thành công!");
    setupDatabase();
  }
});

// /////////// Chương trình con thêm cảnh báo mới ///////////////
function fn_sql_alarm_insert(ID, AlarmName){
    var sqltable_Name = "alarm";
    // Lấy thời gian hiện tại
	var tzoffset = (new Date()).getTimezoneOffset() * 60000; // Vùng Việt Nam (GMT7+)
	var temp_datenow = new Date();
	var timeNow = (new Date(temp_datenow - tzoffset)).toISOString().slice(0, -1).replace("T"," ");
	var timeNow_toSQL = "'" + timeNow + "',";
 
    // Dữ liệu trạng thái báo cáo
    var data_1 = "'" + ID + "',";
    var data_2 = "'I',";
    var data_3 = "'" + AlarmName + "'";
    // Thêm cảnh báo vào SQL
    var str1 = "INSERT INTO " + sqltable_Name + " (date_time, ID, Status, AlarmName) VALUES (";
    var str2 = timeNow_toSQL 
                + data_1 
                + data_2
                + data_3
                ;
    var str = str1 + str2 + ");";
    // Ghi dữ liệu cảnh báo vào SQL
	sqlcon.query(str, function (err, result) {
        if (err) {console.log(err);} else {}
    });
}

// Hàm tự động xác nhận cảnh báo
function fn_sql_alarm_ack(ID){
    var sqltable_Name = "alarm";
 
    // Dữ liệu trạng thái cảnh báo
    var data_1 = " Status = 'IO'";
 
    var str1 = "UPDATE " + sqltable_Name + " SET";
    var str2 = " WHERE ID='" + ID + "'";
 
    var str = str1 + data_1 + str2 + ";";
    // Ghi dữ liệu cảnh báo vào SQL
	sqlcon.query(str, function (err, result) {
        if (err) {console.log(err);} else {}
    });
}
// Hàm chức năng insert Alarm
function fn_Alarm_Manage(){

    Alarm_ID1 = tag_Obj['Lack_of_Pressure'];		// Read trigger alarm ID1
    Alarm_ID2 = tag_Obj['Over_Voltage'];		// Read trigger alarm ID2
    Alarm_ID3 = tag_Obj['Over_Pressure'];		//Read trigger alarm ID3
    Alarm_ID4 = tag_Obj['High_Level'];     //Read trigger alarm ID4
    Alarm_ID5 = tag_Obj['Low_Level'];      //Read trigger alarm ID5
    // Cảnh báo 1
    if (Alarm_ID1 && !Alarm_ID1_old){
        fn_sql_alarm_insert(1, "Thiếu áp suất")
    } if(Alarm_ID1 == false & Alarm_ID1 != Alarm_ID1_old) {
        fn_sql_alarm_ack(1);
    }
    Alarm_ID1_old = Alarm_ID1;

    // Cảnh báo  2
    if (Alarm_ID2 && !Alarm_ID2_old){
        fn_sql_alarm_insert(2, "Quá điện áp")
    } if(Alarm_ID2 == false & Alarm_ID2 != Alarm_ID2_old) {
        fn_sql_alarm_ack(2);
    }
    Alarm_ID2_old = Alarm_ID2;

    // Cảnh báo 3
    if (Alarm_ID3 && !Alarm_ID3_old){
        fn_sql_alarm_insert(3, "Quá áp suất")
    } if(Alarm_ID3 == false & Alarm_ID3 != Alarm_ID3_old) {
        fn_sql_alarm_ack(3);
    }
    Alarm_ID3_old = Alarm_ID3;
       // Cảnh báo 4
       if (Alarm_ID4 && !Alarm_ID4_old){
        fn_sql_alarm_insert(4, "Quá mức nước")
    } if(Alarm_ID4 == false & Alarm_ID4 != Alarm_ID4_old) {
        fn_sql_alarm_ack(4);
    }
    Alarm_ID4_old = Alarm_ID4;
    // Cảnh báo 5
    if (Alarm_ID5 && !Alarm_ID5_old){
        fn_sql_alarm_insert(5, "Thiếu nước")
    } if(Alarm_ID5 == false & Alarm_ID5 != Alarm_ID5_old) {
        fn_sql_alarm_ack(5);
    }
    Alarm_ID5_old = Alarm_ID5;
}
// Đọc dữ liệu Cảnh báo
function fn_Alarm_Show(){
    io.on("connection", function(socket){
        socket.on("msg_Alarm_Show", function(data)
        {
            var sqltable_Name = "alarm";
            var dt_col_Name = "date_time";  // Tên cột thời gian
            var query = "SELECT * FROM " + sqltable_Name + " WHERE Status = 'I' OR Status = 'IO' "  + " ORDER BY " + dt_col_Name + " DESC " + "LIMIT 8" + ";"; 
            sqlcon.query(query, function(err, results, fields) {
                if (err) {
                    console.log(err);
                } else {
                    const objectifyRawPacket = row => ({...row});
                    const convertedResponse = results.map(objectifyRawPacket);
                    socket.emit('Alarm_Show', convertedResponse);
                } 
            });
        });
    });
}
// Tìm kiếm báo cáo theo khoảng thời gian
function fn_Alarm_Search_ByTime(){
    io.on("connection", function(socket){
        socket.on("msg_Alarm_ByTime", function(data)
        {
            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset time Việt Nam (GMT7+)
            // Lấy thời gian tìm kiếm từ date time piker
            var timeS = new Date(data[0]); // Thời gian bắt đầu
            var timeE = new Date(data[1]); // Thời gian kết thúc
            // Quy đổi thời gian ra định dạng cua MySQL
            var timeS1 = "'" + (new Date(timeS - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
            var timeE1 = "'" + (new Date(timeE - tzoffset)).toISOString().slice(0, -1).replace("T"," ") + "'";
            var timeR = timeS1 + "AND" + timeE1; // Khoảng thời gian tìm kiếm (Time Range)

            var sqltable_Name = "alarm"; // Tên bảng
            var dt_col_Name = "date_time";  // Tên cột thời gian

            var Query1 = "SELECT * FROM " + sqltable_Name + " WHERE "+ dt_col_Name + " BETWEEN ";
            var Query = Query1 + timeR + ";";

            sqlcon.query(Query, function(err, results, fields) {
                if (err) {
                    console.log(err);
                } else {
                    const objectifyRawPacket = row => ({...row});
                    const convertedResponse = results.map(objectifyRawPacket);
                    SQL_Excel_Alarm = convertedResponse; // Xuất báo cáo Excel
                    socket.emit('Alarm_ByTime', convertedResponse);
                }
            });
        });
    });
}

// /////////////////////////////// BÁO CÁO EXCEL CẢNH BÁO ///////////////////////////////
const Excel_Alarm = require('exceljs');
const { CONNREFUSED } = require('dns');
const fs = require('fs');

function fn_excelExport_Alarm(){
    // =====================CÁC THUỘC TÍNH CHUNG=====================
        // Lấy ngày tháng hiện tại
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        let day = date_ob.getDay();
        var dayName = '';
        if(day == 0){dayName = 'Chủ nhật,'}
        else if(day == 1){dayName = 'Thứ hai,'}
        else if(day == 2){dayName = 'Thứ ba,'}
        else if(day == 3){dayName = 'Thứ tư,'}
        else if(day == 4){dayName = 'Thứ năm,'}
        else if(day == 5){dayName = 'Thứ sáu,'}
        else if(day == 6){dayName = 'Thứ bảy,'}
        else{};
    // Tạo và khai báo Excel
    let workbook = new Excel_Alarm.Workbook()
    let worksheet =  workbook.addWorksheet('dữ liệu cảnh báo', {
      pageSetup:{paperSize: 9, orientation:'landscape'},
      properties:{tabColor:{argb:'FFC0000'}},
    });
    // Page setup (cài đặt trang)
    worksheet.properties.defaultRowHeight = 20;
    worksheet.pageSetup.margins = {
      left: 0.3, right: 0.25,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    // =====================THẾT KẾ HEADER=====================
    // Logo trường
    // Trong môi trường Railway, không thể đọc file từ hệ thống
    // Thay thế logo bằng text
    /*
    const imageId1 = workbook.addImage({
        filename: 'public/images/logo.png',
        extension: 'png',
    });
    worksheet.addImage(imageId1, 'A1:A3');
    */
    
    // Thông tin công ty
    worksheet.getCell('B1').value = 'Trường Đại Học Sư Phạm Kỹ Thuật Thành Phố Hồ Chí Minh';
    worksheet.getCell('B1').style = { font:{bold: true,size: 14},alignment: {vertical: 'middle'}} ;
    worksheet.getCell('B2').value = 'Báo cáo lỗi hệ thống';
    worksheet.getCell('B2').style = { font:{bold: true,size: 14},alignment: {vertical: 'middle'}} ;
    worksheet.getCell('B3').value = 'Nhóm sv thực hiện: Lương & Nương';
    worksheet.getCell('B3').style = { font:{bold: true,size: 14},alignment: {vertical: 'middle'}} ;
    // Tên báo cáo
    worksheet.getCell('A5').value = 'BÁO CÁO LỖI HỆ THỐNG BỒN NƯỚC';
    worksheet.mergeCells('A5:F5');
    worksheet.getCell('A5').style = { font:{name: 'Times New Roman', bold: true,size: 16},alignment: {horizontal:'center',vertical: 'middle'}} ;
    // Ngày in biểu
    worksheet.getCell('F7').value = "Ngày in biểu: " + dayName + date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
    worksheet.getCell('F7').style = { font:{bold: false, italic: true},alignment: {horizontal:'center',vertical: 'bottom',wrapText: false}} ;
    
    // Tên nhãn các cột
    var rowpos = 8;
    var collumName = ["NO.","Date Time", "ID","Status", "Alarm Name", "Note"]
    worksheet.spliceRows(rowpos, 1, collumName);

    // =====================XUẤT DỮ LIỆU EXCEL ALARM=====================
    // Dump all the data into Excel
    var rowIndex = 0;
    SQL_Excel_Alarm.forEach((e, index) => {
    // row 1 is the header.
    rowIndex =  index + rowpos;
    // worksheet1 collum
    worksheet.columns = [
          {key: 'STT'},
          {key: 'date_time'},
          {key: 'ID'},
          {key: 'Status'},
          {key: 'AlarmName'}
        ]
    worksheet.addRow({
          STT: {
            formula: index + 1
          },
          ...e
        })
    })
    // Lấy tổng số hàng
    const totalNumberOfRows = worksheet.rowCount; 
    
    // =====================STYLE CHO CÁC CỘT/HÀNG=====================
    // Style các cột nhãn
    const HeaderStyle = ['A','B', 'C', 'D', 'E','F']
    HeaderStyle.forEach((v) => {
        worksheet.getCell(`${v}${rowpos}`).style = { font:{bold: true},alignment: {horizontal:'center',vertical: 'middle',wrapText: true}} ;
        worksheet.getCell(`${v}${rowpos}`).border = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        }
    })
    // Cài đặt độ rộng cột
    worksheet.columns.forEach((column, index) => {
        column.width = 15;
    })
    // Set width header
    worksheet.getColumn(1).width = 12;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(5).width = 50;
    worksheet.getColumn(6).width = 50;
     
    // ++++++++++++Style cho các hàng dữ liệu++++++++++++
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      var datastartrow = rowpos;
      var rowindex = rowNumber + datastartrow;
      const rowlength = datastartrow + SQL_Excel_Alarm.length
      if(rowindex >= rowlength+1){rowindex = rowlength+1}
      const insideColumns = ['A','B', 'C', 'D', 'E','F']
    // Tạo border
      insideColumns.forEach((v) => {
          // Border
        worksheet.getCell(`${v}${rowindex}`).border = {
          top: {style: 'thin'},
          bottom: {style: 'thin'},
          left: {style: 'thin'},
          right: {style: 'thin'}
        },
        // Alignment
        worksheet.getCell(`${v}${rowindex}`).alignment = {horizontal:'center',vertical: 'middle',wrapText: true}
      })
    })
     
     
    // =====================THẾT KẾ FOOTER=====================
    worksheet.getCell(`F${totalNumberOfRows+2}`).value = 'Ngày …………tháng ……………năm 20………';
    worksheet.getCell(`F${totalNumberOfRows+2}`).style = { font:{bold: true, italic: false},alignment: {horizontal:'center',vertical: 'middle',wrapText: false}} ;
     
    worksheet.getCell(`F${totalNumberOfRows+3}`).value = 'Người in biểu';
    worksheet.getCell(`F${totalNumberOfRows+4}`).value = '(Ký, ghi rõ họ tên)';
    worksheet.getCell(`F${totalNumberOfRows+3}`).style = { font:{bold: true, italic: false},alignment: {horizontal:'center',vertical: 'middle',wrapText: false}} ;
    worksheet.getCell(`F${totalNumberOfRows+4}`).style = { font:{bold: false, italic: true},alignment: {horizontal:'center',vertical: 'middle',wrapText: false}} ;

    // =====================THỰC HIỆN XUẤT DỮ LIỆU EXCEL=====================
    // Tạo thư mục Report nếu chưa tồn tại
    try {
        // Đường dẫn đến thư mục public/Report
        const reportDir = path.join(__dirname, 'public', 'Report');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        // Export Link
        var currentTime = year + "_" + month + "_" + date + "_" + hours + "h" + minutes + "m" + seconds + "s";
        var saveasDirect = "Report/Report_" + currentTime + ".xlsx";
        SaveAslink = saveasDirect; // Send to client
        var booknameLink = path.join(__dirname, 'public', saveasDirect);
        
        var Bookname = "Report_" + currentTime + ".xlsx";
        // Write book name
        workbook.xlsx.writeFile(booknameLink)
            .then(() => {
                console.log('File Excel đã được lưu thành công tại:', booknameLink);
            })
            .catch(err => {
                console.error('Lỗi khi lưu file Excel:', err);
                // Trong môi trường cloud, trả về buffer thay vì lưu file
                SaveAslink = null;
                Bookname = null;
            });
    } catch (err) {
        console.error('Lỗi khi tạo thư mục hoặc lưu file Excel:', err);
        // Trong môi trường cloud, không thể lưu file
        SaveAslink = null;
        Bookname = null;
    }
     
    // Return
    return [SaveAslink, Bookname]
}

// =====================TRUYỀN NHẬN DỮ LIỆU VỚI TRÌNH DUYỆT=====================
// Hàm chức năng truyền nhận dữ liệu với trình duyệt
function fn_Require_ExcelExport_Alarm(){
    io.on("connection", function(socket){
        socket.on("msg.Excel_Report_Alarm", function(data)
        {
            const [SaveAslink1, Bookname] = fn_excelExport_Alarm();
            var data = [SaveAslink1, Bookname];
            socket.emit('send_Excel_Report_Alarm', data);
        });
    });
}
