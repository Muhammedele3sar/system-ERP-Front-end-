document.addEventListener('DOMContentLoaded', () => {
    // التحقق من تسجيل الدخول في كل الصفحات المحمية
    if (document.body.classList.contains('login-page') === false) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn !== 'true') {
            // إذا لم يكن مسجلاً، يتم توجيهه لصفحة الدخول
            window.location.href = 'index.html';
            return; // إيقاف تنفيذ باقي الكود
        }
    }

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const logoutBtn = document.getElementById('logoutBtn');

    // فتح وإغلاق القائمة الجانبية (للسطح المكتب)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // فتح وإغلاق القائمة الجانبية (للهاتف)
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // تسجيل الخروج
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('هل أنت متأكد من أنك تريد تسجيل الخروج؟')) {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'index.html';
            }
        });
    }

    // إدارة الـ Modals
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    };

    // إغلاق الـ Modal عند الضغط على زر الإغلاق
    document.querySelectorAll('.close-modal, .modal .btn-secondary').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // إغلاق الـ Modal عند الضغط خارج المحتوى
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    });
});
