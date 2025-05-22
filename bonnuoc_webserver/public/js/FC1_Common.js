////////////// YÊU CẦU DỮ LIỆU TỪ SERVER- REQUEST DATA //////////////
var myVar = setInterval(myTimer, 100);
function myTimer()
{
    socket.emit("Client-send-data", "Request data client");
}
////////////// CÁC KHỐI CHƯƠNG TRÌNH CON ///////////////////////////
// Chương trình con đọc dữ liệu lên IO Field
function fn_IOFieldDataShow(tag, IOField, tofix)
{
    socket.on(tag, function(data){
        if (tofix == 0)
        {
            document.getElementById(IOField).value = data;
        }
        else
        {
            document.getElementById(IOField).value = data.toFixed(tofix);
        }
    });
}
// Chương trình con đổi màu Symbol
function fn_SymbolStatus(ObjectID, SymName, Tag)
{
    var imglink_0 = "images/Symbol/" + SymName + "_0.png"; // Trạng thái tag = 0
    var imglink_1 = "images/Symbol/" + SymName + "_1.png"; // Trạng thái tag = 1
    var imglink_2 = "images/Symbol/" + SymName + "_2.png"; // Trạng thái tag = 2
    var imglink_3 = "images/Symbol/" + SymName + "_3.png"; // Trạng thái tag = 3
    var imglink_4 = "images/Symbol/" + SymName + "_4.png"; // Trạng thái tag = 4
    var imglink_5 = "images/Symbol/" + SymName + "_5.png"; // Trạng thái tag = 5
    socket.on(Tag, function(data){
        if (data == 0)
        {
            document.getElementById(ObjectID).src = imglink_0;
        }
        else if (data == 1)
        {
            document.getElementById(ObjectID).src = imglink_1;
        }
        else if (data == 2)
        {
            document.getElementById(ObjectID).src = imglink_2;
        }
        else if (data == 3)
        {
            document.getElementById(ObjectID).src = imglink_3;
        }
        else if (data == 4)
        {
            document.getElementById(ObjectID).src = imglink_4;
        }
        else
        {
            document.getElementById(ObjectID).src = imglink_0;
        }
    });
}

// Chương trình con chuyển trang
function fn_ScreenChange(scr_1, scr_2, scr_3, scr_4, scr_5, scr_6, scr_7,scr_8)
{
    document.getElementById(scr_1).style.display = 'block';   // Hiển thị trang được chọn
    document.getElementById(scr_2).style.display = 'none';    // Ẩn trang 1
    document.getElementById(scr_3).style.display = 'none';
    document.getElementById(scr_4).style.display = 'none';
    document.getElementById(scr_5).style.display = 'none';
    document.getElementById(scr_6).style.display = 'none';
    document.getElementById(scr_7).style.display = 'none';
    document.getElementById(scr_8).style.display = 'none';
}

// Chương trình con nút sửa/lưu dữ liệu
function fn_DataEdit(button1, button2)
{
    document.getElementById(button1).style.zIndex='1';  // Hiển nút 1
    document.getElementById(button2).style.zIndex='0';  // Ẩn nút 2
}

// Hàm hiển thị màu nút nhấn
function fn_btt_Color(tag, bttID, on_Color, off_Color) {
    socket.on(tag, function (data) {
        if (data == true) {
            document.getElementById(bttID).style.backgroundColor = on_Color;
        } else {
            document.getElementById(bttID).style.backgroundColor = off_Color;
        }
    });
}