// Hàm chức năng xuất dữ liệu excel
function fn_excel_Alarm(){
    socket.emit("msg.Excel_Report_Alarm",true);
    // Đã chuyển socket.on ra function fn_excel-Display
}
// Hiển thị kết quả xuất dữ liệu excel
function fn_excel_Alarm_Display(){
    var linktext ="";
    var bookname ="";
    socket.on('',function(data){
        linktext = data[0];
        bookname = data[1];
        //delay save as
        var delayInMillseconds= 1000; // delay 1s
        setTimeout(function(){
            saveAs(linktext, bookname);
        }, delayInMilliseconds);
    });
}