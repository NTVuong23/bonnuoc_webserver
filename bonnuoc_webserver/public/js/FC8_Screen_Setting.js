///// CHƯƠNG TRÌNH CON NÚT NHẤN SỬA //////
// Tạo 1 tag tạm báo đang sửa dữ liệu
var Auto_Scr_data_edditting = false;
function fn_scrAuto_EditBtt(){
    // Cho hiển thị nút nhấn lưu
    fn_DataEdit('btt_scrAuto_Save_sp','btt_scrAuto_Edit_sp');
    // Cho tag báo đang sửa dữ liệu lên giá trị true
    Auto_Scr_data_edditting = true; 
    // Kích hoạt chức năng sửa của các IO Field
    document.getElementById("ScrAuto_Setpoint_Level").disabled = false; // 
}
///// CHƯƠNG TRÌNH CON NÚT NHẤN LƯU //////
function fn_scrAuto_SaveBtt(){
    // Cho hiển thị nút nhấn sửa
    fn_DataEdit('btt_scrAuto_Edit_sp','btt_scrAuto_Save_sp');
    // Cho tag đang sửa dữ liệu về 0
    Auto_Scr_data_edditting = false; 
                        // Gửi dữ liệu cần sửa xuống PLC
    var Edit_Setpoint = document.getElementById("ScrAuto_Setpoint_Level").value;
    // Chuyển đổi sang số thực trước khi gửi
    var numericValue = parseFloat(Edit_Setpoint);
    console.log("Gửi giá trị Level_Setpoint:", numericValue);
    socket.emit('cmd_Edit_Data', numericValue);
    alert('Dữ liệu đã được lưu!');
    // Vô hiệu hoá chức năng sửa của các IO Field
    document.getElementById("ScrAuto_Setpoint_Level").disabled = true;  
}
 
// Chương trình con đọc dữ liệu lên IO Field
function fn_scrAuto_IOField_IO(tag, IOField, tofix)
{
    socket.on(tag, function(data){
        if (tofix == 0 & Auto_Scr_data_edditting != true)
        {
            document.getElementById(IOField).value = data;
        }
        else if(Auto_Scr_data_edditting != true)
        {
            document.getElementById(IOField).value = data.toFixed(tofix);
        }
    });
}
///// CHƯƠNG TRÌNH CON NÚT NHẤN SỬA //////
// Tạo 1 tag tạm báo đang sửa dữ liệu
var Manu_Scr_data_edditting = false;
function fn_scrManu_EditBtt(){
    // Cho hiển thị nút nhấn lưu
    fn_DataEdit('btt_scrManu_Save_sp','btt_scrManu_Edit_sp');
    // Cho tag báo đang sửa dữ liệu lên giá trị true
    Manu_Scr_data_edditting = true; 
    // Kích hoạt chức năng sửa của các IO Field
    document.getElementById("ScrManu_Setpoint_Level").disabled = false; // 
}
///// CHƯƠNG TRÌNH CON NÚT NHẤN LƯU //////
function fn_scrManu_SaveBtt(){
    // Cho hiển thị nút nhấn sửa
    fn_DataEdit('btt_scrManu_Edit_sp','btt_scrManu_Save_sp');
    // Cho tag đang sửa dữ liệu về 0
    Manu_Scr_data_edditting = false; 
                        // Gửi dữ liệu cần sửa xuống PLC
    var Edit_Setpoint_1 = document.getElementById("ScrManu_Setpoint_Level").value;
    // Chuyển đổi sang số thực trước khi gửi
    var numericValue = parseFloat(Edit_Setpoint_1);
    console.log("Gửi giá trị Level_Setpoint:", numericValue);
    socket.emit('cmd_Edit_Data', numericValue);
    alert('Dữ liệu đã được lưu!');
    // Vô hiệu hoá chức năng sửa của các IO Field
    document.getElementById("ScrManu_Setpoint_Level").disabled = true;  
}
 
// Chương trình con đọc dữ liệu lên IO Field
function fn_scrManu_IOField_IO(tag, IOField, tofix)
{
    socket.on(tag, function(data){
        if (tofix == 0 & Manu_Scr_data_edditting != true)
        {
            document.getElementById(IOField).value = data;
        }
        else if(Manu_Scr_data_edditting != true)
        {
            document.getElementById(IOField).value = data.toFixed(tofix);
        }
    });
}
///// CHƯƠNG TRÌNH CON NÚT NHẤN SỬA //////
// Tạo 1 tag tạm báo đang sửa dữ liệu
var Set_PID_Scr_data_edditting = false;
function fn_scrSet_PID_EditBtt(){
    // Cho hiển thị nút nhấn lưu
    fn_DataEdit('btt_scrSet_PID_Save','btt_scrSet_PID_Edit');
    // Cho tag báo đang sửa dữ liệu lên giá trị true
    Set_PID_Scr_data_edditting = true; 
    // Kích hoạt chức năng sửa của các IO Field
    document.getElementById("set_PID_Gain_Level").disabled = false; // 
    document.getElementById("set_PID_Ti_Level").disabled = false; // 
    document.getElementById("set_PID_Td_Level").disabled = false; // 
    document.getElementById("set_PID_TdFiltRatio_Level").disabled = false; // 
    document.getElementById("set_PID_PWeighting_Level").disabled = false; // 
    document.getElementById("set_PID_DWeighting_Level").disabled = false; // 
    document.getElementById("set_PID_Cycle_Level").disabled = false; //
    // Kích hoạt chức năng sửa của các IO Field
    document.getElementById("set_PID_Gain_Pressure").disabled = false; // 
    document.getElementById("set_PID_Ti_Pressure").disabled = false; // 
    document.getElementById("set_PID_Td_Pressure").disabled = false; // 
    document.getElementById("set_PID_TdFiltRatio_Pressure").disabled = false; // 
    document.getElementById("set_PID_PWeighting_Pressure").disabled = false; // 
    document.getElementById("set_PID_DWeighting_Pressure").disabled = false; // 
    document.getElementById("set_PID_Cycle_Pressure").disabled = false; //
}
///// CHƯƠNG TRÌNH CON NÚT NHẤN LƯU //////
function fn_scrSet_PID_SaveBtt(){
// Cho hiển thị nút nhấn sửa
    fn_DataEdit('btt_scrSet_PID_Edit','btt_scrSet_PID_Save');
        // Cho tag đang sửa dữ liệu về 0
        Set_PID_Scr_data_edditting = false; 
                            // Gửi dữ liệu cần sửa xuống PLC
        var data_edit_array_1 = [ document.getElementById('set_PID_Gain_Level').value,
                                document.getElementById('set_PID_Ti_Level').value,
                                document.getElementById('set_PID_Td_Level').value,
                                document.getElementById('set_PID_TdFiltRatio_Level').value,
                                document.getElementById('set_PID_PWeighting_Level').value,
                                document.getElementById('set_PID_DWeighting_Level').value,
                                document.getElementById('set_PID_Cycle_Level').value,
                                document.getElementById('set_PID_Gain_Pressure').value,
                                document.getElementById('set_PID_Ti_Pressure').value,
                                document.getElementById('set_PID_Td_Pressure').value,
                                document.getElementById('set_PID_TdFiltRatio_Pressure').value,
                                document.getElementById('set_PID_PWeighting_Pressure').value,
                                document.getElementById('set_PID_DWeighting_Pressure').value,
                                document.getElementById('set_PID_Cycle_Pressure').value];
        socket.emit('cmd_Edit_Data_PID', data_edit_array_1);
        alert('Dữ liệu đã được lưu!');
        // Vô hiệu hoá chức năng sửa của các IO Field
        document.getElementById("set_PID_Gain_Level").disabled = true;  
        document.getElementById("set_PID_Ti_Level").disabled = true;  
        document.getElementById("set_PID_Td_Level").disabled = true; //
        document.getElementById("set_PID_TdFiltRatio_Level").disabled = true;  
        document.getElementById("set_PID_PWeighting_Level").disabled = true;  
        document.getElementById("set_PID_DWeighting_Level").disabled = true; //
        document.getElementById("set_PID_Cycle_Level").disabled = true; //
        // Vô hiệu hoá chức năng sửa của các IO Field
        document.getElementById("set_PID_Gain_Pressure").disabled = true;  
        document.getElementById("set_PID_Ti_Pressure").disabled = true;  
        document.getElementById("set_PID_Td_Pressure").disabled = true; //
        document.getElementById("set_PID_TdFiltRatio_Pressure").disabled = true;  
        document.getElementById("set_PID_PWeighting_Pressure").disabled = true;  
        document.getElementById("set_PID_DWeighting_Pressure").disabled = true; //
        document.getElementById("set_PID_Cycle_Pressure").disabled = true; //
}
 
// Chương trình con đọc dữ liệu lên IO Field
function fn_scrSet_PID_IOField_IO(tag, IOField, tofix)
{
    socket.on(tag, function(data){
        if (tofix == 0 & Set_PID_Scr_data_edditting != true)
        {
            document.getElementById(IOField).value = data;
        }
        else if(Set_PID_Scr_data_edditting != true)
        {
            document.getElementById(IOField).value = data.toFixed(tofix);
        }
    });
}
