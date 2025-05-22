// Chương trình con đọc dữ liệu SQL
function fn_Alarm_Show(){
    socket.emit("msg_Alarm_Show", "true");
    socket.on('Alarm_Show',function(data){
        fn_table_Alarm(data);
    }); 
}
 
// Chương trình con hiển thị SQL ra bảng
function fn_table_Alarm(data){
    if(data){
        $("#table_Alarm tbody").empty(); 
        var len = data.length;
        var txt = "<tbody>";
        if(len > 0){
            for(var i=0;i<len;i++){
                    txt += "<tr><td>"+data[i].date_time
                        +"</td><td>"+data[i].ID
                        +"</td><td>"+data[i].Status
                        +"</td><td>"+data[i].AlarmName
                        +"</td></tr>";
                    }
            if(txt != ""){
            txt +="</tbody>"; 
            $("#table_Alarm").append(txt);
            }
        }
    }   
}
// Tìm kiếm cảnh báo theo thời gian
/*function fn_Alarm_By_Time()
{
    var val = [document.getElementById('dtpk_AL_Search_Start').value,
               document.getElementById('dtpk_AL_Search_End').value];
    socket.emit('msg_Alarm_ByTime', val);
    socket.on('Alarm_ByTime', function(data){
        fn_table_Alarm(data); // Show alarm
    });
}*/

// Tìm kiếm cảnh báo theo thời gian
function fn_Alarm_By_Time()
{
    let start=document.getElementById('dtpk_AL_Search_Start').value;
    let end=document.getElementById('dtpk_AL_Search_End').value;
    if (start=='' || end==''){
        alert('Can chon ngay gio truc khi tim kiem');
        return; //dừng thoát ko chạy tiếp
    }

    //Nếu ok hì chạy tiếp 
    var val = [start, end];
    socket.emit('msg_Alarm_ByTime', val);
}
// Hàm hiển thị kết quả theo thời gian => gọi 1 lần trong thẻ script trong home
function fn_Alarm_By_Time_Display()
{
    socket.on('Alarm_ByTime',function(data){
        fn_table_Alarm(data);// Show Alarm
    });
}
