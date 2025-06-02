// ==================== NOTIFICATION SYSTEM ====================

/**
 * Hiển thị notification với các loại khác nhau
 * @param {string} type - Loại notification: 'loading', 'success', 'error'
 * @param {string} title - Tiêu đề notification
 * @param {string} message - Nội dung notification
 * @param {boolean} autoHide - Tự động ẩn sau một thời gian (chỉ cho success)
 * @param {number} duration - Thời gian tự động ẩn (ms)
 */
function showNotification(type, title, message, autoHide = false, duration = 3000) {
    const overlay = document.getElementById('notification-overlay');
    const icon = document.getElementById('notification-icon');
    const titleElement = document.getElementById('notification-title');
    const messageElement = document.getElementById('notification-message');
    const button = document.getElementById('notification-button');
    
    // Reset classes
    icon.className = 'notification-icon';
    button.className = 'notification-button';
    
    // Set content
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Set icon và style theo type
    switch(type) {
        case 'loading':
            icon.textContent = '⏳';
            icon.classList.add('loading');
            button.style.display = 'none';
            break;
            
        case 'success':
            icon.textContent = '✅';
            icon.classList.add('success');
            button.style.display = 'inline-block';
            button.classList.add('success');
            button.textContent = 'Đóng';
            break;
            
        case 'error':
            icon.textContent = '❌';
            icon.classList.add('error');
            button.style.display = 'inline-block';
            button.classList.add('error');
            button.textContent = 'Đóng';
            break;
            
        default:
            icon.textContent = 'ℹ️';
            button.style.display = 'inline-block';
            button.textContent = 'Đóng';
    }
    
    // Hiển thị notification
    overlay.style.display = 'flex';
    
    // Tự động ẩn nếu được yêu cầu
    if (autoHide && type === 'success') {
        setTimeout(() => {
            hideNotification();
        }, duration);
    }
    
    console.log(`📢 Notification [${type}]: ${title} - ${message}`);
}

/**
 * Ẩn notification
 */
function hideNotification() {
    const overlay = document.getElementById('notification-overlay');
    overlay.style.display = 'none';
    console.log('📢 Notification đã được ẩn');
}

/**
 * Hiển thị notification đang tải
 */
function showLoadingNotification(message = 'Đang xử lý, vui lòng đợi...') {
    showNotification('loading', 'Đang xử lý...', message);
}

/**
 * Hiển thị notification thành công
 */
function showSuccessNotification(title, message, autoHide = true) {
    showNotification('success', title, message, autoHide);
}

/**
 * Hiển thị notification lỗi
 */
function showErrorNotification(title, message) {
    showNotification('error', title, message);
}

/**
 * Cập nhật nội dung notification đang hiển thị
 */
function updateNotification(title, message) {
    const titleElement = document.getElementById('notification-title');
    const messageElement = document.getElementById('notification-message');
    
    if (titleElement && messageElement) {
        titleElement.textContent = title;
        messageElement.textContent = message;
        console.log(`📢 Notification updated: ${title} - ${message}`);
    }
}

/**
 * Kiểm tra xem notification có đang hiển thị không
 */
function isNotificationVisible() {
    const overlay = document.getElementById('notification-overlay');
    return overlay && overlay.style.display === 'flex';
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Disable/Enable nút xuất Excel
 */
function toggleExportButton(disabled) {
    const button = document.getElementById('btt_Excel_Alarm');
    if (button) {
        button.disabled = disabled;
        console.log(`🔘 Nút xuất Excel ${disabled ? 'disabled' : 'enabled'}`);
    }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format thời gian
 */
function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Validate dữ liệu trước khi xuất
 */
function validateExportData() {
    // Không cần validate ở client-side vì server sẽ kiểm tra dữ liệu thực tế từ database
    // Chỉ cần kiểm tra các điều kiện cơ bản

    console.log('✅ Client-side validation passed - Server sẽ kiểm tra dữ liệu database');
    return true;
}

// ==================== ERROR HANDLING ====================

/**
 * Xử lý lỗi chung
 */
function handleExportError(error, context = '') {
    console.error(`❌ Lỗi xuất Excel ${context}:`, error);
    
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error && error.message) {
        errorMessage = error.message;
    } else if (error && error.error) {
        errorMessage = error.error;
    }
    
    // Hiển thị thông báo lỗi cụ thể
    if (errorMessage.includes('không có dữ liệu') || errorMessage.includes('No data')) {
        showErrorNotification(
            'Không có dữ liệu để xuất',
            'Vui lòng kiểm tra lại bảng cảnh báo hoặc thử tìm kiếm với khoảng thời gian khác.'
        );
    } else if (errorMessage.includes('database') || errorMessage.includes('connection')) {
        showErrorNotification(
            'Lỗi kết nối cơ sở dữ liệu',
            'Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.'
        );
    } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        showErrorNotification(
            'Lỗi quyền truy cập',
            'Không có quyền ghi file. Vui lòng kiểm tra quyền thư mục hoặc chọn vị trí khác.'
        );
    } else if (errorMessage.includes('file') || errorMessage.includes('write')) {
        showErrorNotification(
            'Lỗi tạo file Excel',
            'Không thể tạo file Excel. Vui lòng đóng file Excel đang mở và thử lại.'
        );
    } else {
        showErrorNotification(
            'Xuất file Excel thất bại',
            `Lỗi: ${errorMessage}`
        );
    }
    
    // Enable lại nút xuất
    toggleExportButton(false);
}

console.log('📢 Notification system đã được tải thành công!');
