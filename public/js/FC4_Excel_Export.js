// Hàm chức năng xuất dữ liệu excel
function fn_excel_Alarm(){
    console.log('🚀 Bắt đầu quá trình xuất Excel...');

    try {
        // Validate dữ liệu trước khi xuất
        validateExportData();

        // Disable nút xuất để tránh nhấn nhiều lần
        toggleExportButton(true);

        // Hiển thị notification đang tải
        showLoadingNotification('Đang chuẩn bị dữ liệu và tạo file Excel...');

        // Gửi yêu cầu xuất Excel đến server
        socket.emit("msg.Excel_Report_Alarm", {
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substr(2, 9)
        });

        console.log('📤 Đã gửi yêu cầu xuất Excel đến server');

    } catch (error) {
        handleExportError(error, 'khi validate dữ liệu');
    }
}
// Hiển thị kết quả xuất dữ liệu excel
function fn_excel_Alarm_Display(){
    // Lắng nghe phản hồi thành công từ server
    socket.on('send_Excel_Report_Alarm', function(data) {
        console.log('📥 Nhận phản hồi từ server:', data);

        try {
            if (!data || data.length < 2) {
                throw new Error('Dữ liệu phản hồi từ server không hợp lệ');
            }

            const linktext = data[0];
            const bookname = data[1];
            const fileSize = data[2] || 'Không xác định';

            if (!linktext || !bookname) {
                throw new Error('Thông tin file không hợp lệ');
            }

            console.log('📄 File Excel được tạo:', bookname);
            console.log('📂 Đường dẫn:', linktext);
            console.log('📊 Kích thước:', fileSize);

            // Cập nhật notification
            updateNotification(
                'Đang tải file...',
                `File ${bookname} đã được tạo thành công. Đang chuẩn bị tải xuống...`
            );

            // Delay trước khi download
            setTimeout(function(){
                try {
                    // Tạo URL download từ đường dẫn file
                    const downloadUrl = linktext.replace('./public', '');
                    console.log('🔗 URL download:', downloadUrl);

                    // Sử dụng HTML5 download API để hiển thị dialog lưu file
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = bookname;
                    link.style.display = 'none';

                    // Thêm vào DOM và trigger click
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    console.log('✅ Đã trigger download file Excel');

                    // Hiển thị thông báo thành công
                    const currentTime = formatDateTime(new Date());
                    showSuccessNotification(
                        'Xuất file Excel thành công!',
                        `File "${bookname}" đã được tạo và tải xuống.\nThời gian: ${currentTime}\nKích thước: ${fileSize}`,
                        true
                    );

                } catch (downloadError) {
                    throw new Error(`Lỗi khi tải file: ${downloadError.message}`);
                }

                // Enable lại nút xuất
                toggleExportButton(false);

            }, 1000);

        } catch (error) {
            handleExportError(error, 'khi xử lý phản hồi từ server');
        }
    });

    // Lắng nghe lỗi từ server
    socket.on('send_Excel_Report_Alarm_Error', function(errorData) {
        console.error('❌ Nhận lỗi từ server:', errorData);
        handleExportError(errorData.error || 'Lỗi từ server', 'từ server');
    });
}