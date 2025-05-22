// Danh sách người dùng
var admin = ["ID1","123"]
var Operator = ["ID2","456"]
    
// Chương trình con
function login()
{
    var a = document.getElementById("inputuser").value;
    var b = document.getElementById("inputpass").value;
    // Admin
    if (a == admin[0] && b == admin[1])
    {
        fn_ScreenChange('Screen_Monitoring','Screen_Auto','Screen_Manu','Screen_Setting_1','Screen_Alarm','Screen_Trend_Level','Screen_Home','Screen_IT5200');
        document.getElementById('id01').style.display='none';
    }
    // Operator
    else if (a == Operator[0] && b == Operator[1])
    {
        fn_ScreenChange('Screen_Monitoring','Screen_Auto','Screen_Manu','Screen_Setting_1','Screen_Alarm','Screen_Trend_Level','Screen_Home','Screen_IT5200');
        document.getElementById('id01').style.display='none';
        document.getElementById("bttAuto_Set_Paramas").disabled = true;
        document.getElementById("bttAuto_Set_Pid").disabled = true;
    }
    
    else
    {
        window.location.href = '';
    }
}
function logout() // Ctrinh login
{
    alert("Successful Log out");
    window.location.href = 'Go_back_replay_the_page';
}