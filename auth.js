document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // بيانات الدخول الافتراضية
            if (username === 'admin' && password === 'admin123') {
                // تخزين حالة تسجيل الدخول
                localStorage.setItem('isLoggedIn', 'true');
                
                // رسالة ترحيب وتوجيه
                alert('تم تسجيل الدخول بنجاح! مرحباً بك.');
                window.location.href = 'dashboard.html';
            } else {
                alert('اسم المستخدم أو كلمة المرور غير صحيحة.');
            }
        });
    }
});
