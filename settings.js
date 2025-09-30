document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('settingsForm')) return;

    // --- Element References ---
    const settingsForm = document.getElementById('settingsForm');
    const companyNameInput = document.getElementById('companyName');
    const currencySymbolInput = document.getElementById('currencySymbol');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');

    // --- Data Management ---
    let settings = JSON.parse(localStorage.getItem('settings')) || { companyName: '', currencySymbol: 'ج.م' };
    const saveSettings = () => localStorage.setItem('settings', JSON.stringify(settings));

    // --- Event Listeners ---
    settingsForm.addEventListener('submit', e => {
        e.preventDefault();
        settings.companyName = companyNameInput.value;
        settings.currencySymbol = currencySymbolInput.value;
        saveSettings();
        alert('تم حفظ الإعدادات بنجاح!');
    });

    clearDataBtn.addEventListener('click', () => {
        if (confirm('تحذير! هل أنت متأكد من أنك تريد مسح جميع بيانات النظام؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            if (confirm('التأكيد النهائي: سيتم حذف جميع الفواتير، المنتجات، العملاء، وكل البيانات الأخرى.')) {
                localStorage.removeItem('sales');
                localStorage.removeItem('purchases');
                localStorage.removeItem('products');
                localStorage.removeItem('customers');
                localStorage.removeItem('settings');
                alert('تم مسح جميع البيانات بنجاح.');
                // Redirect to login page after clearing data
                window.location.href = 'index.html';
            }
        }
    });

    exportDataBtn.addEventListener('click', () => {
        const dataToExport = {
            sales: JSON.parse(localStorage.getItem('sales')) || [],
            products: JSON.parse(localStorage.getItem('products')) || [],
            customers: JSON.parse(localStorage.getItem('customers')) || [],
            purchases: JSON.parse(localStorage.getItem('purchases')) || [],
            settings: JSON.parse(localStorage.getItem('settings')) || {},
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('تم تصدير البيانات بنجاح.');
    });

    // --- Core Functions ---
    function loadSettings() {
        companyNameInput.value = settings.companyName;
        currencySymbolInput.value = settings.currencySymbol;
    }

    // --- Initial Load ---
    loadSettings();
});
