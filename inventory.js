document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('stockTableBody')) return;

    // --- Data Management ---
    let products = JSON.parse(localStorage.getItem('products')) || [
        { id: 'P001', name: 'لابتوب Dell XPS', warehouse: 'المخزن الرئيسي', stock: 15, minLevel: 5, purchasePrice: 22000, salePrice: 25000 },
        { id: 'P002', name: 'شاشة Samsung 27"', warehouse: 'المخزن الرئيسي', stock: 25, minLevel: 10, purchasePrice: 4000, salePrice: 4500 },
        { id: 'P003', name: 'كيبورد ميكانيكي', warehouse: 'المخزن الفرعي', stock: 8, minLevel: 10, purchasePrice: 650, salePrice: 800 },
        { id: 'P004', name: 'ماوس لاسلكي', warehouse: 'المخزن الرئيسي', stock: 0, minLevel: 15, purchasePrice: 280, salePrice: 350 },
    ];

    // --- Element References ---
    const stockTableBody = document.getElementById('stockTableBody');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- Event Listeners ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = document.getElementById(tab.dataset.tab + 'Tab');
            tabContents.forEach(tc => tc.classList.remove('active'));
            target.classList.add('active');
        });
    });

    document.getElementById('transferBtn').addEventListener('click', () => openModal('transferModal'));
    document.getElementById('adjustmentBtn').addEventListener('click', () => openModal('adjustmentModal'));

    // --- Core Functions ---
    function getStockStatus(product) {
        if (product.stock <= 0) return { text: 'نفذ', class: 'cancelled' };
        if (product.stock <= product.minLevel) return { text: 'كمية منخفضة', class: 'pending' };
        return { text: 'متوفر', class: 'paid' };
    }

    function loadStock() {
        stockTableBody.innerHTML = '';
        if (products.length === 0) {
            stockTableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد منتجات في المخزون.</td></tr>';
            return;
        }

        products.forEach(item => {
            const status = getStockStatus(item);
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.warehouse}</td>
                <td>${item.stock}</td>
                <td>${item.minLevel}</td>
                <td>${item.purchasePrice.toLocaleString('ar-EG')} ج.م</td>
                <td>${item.salePrice.toLocaleString('ar-EG')} ج.م</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td class="action-buttons">
                    <button class="btn-view" title="عرض الحركات"><i class="fas fa-history"></i></button>
                    <button class="btn-edit" title="تعديل المنتج"><i class="fas fa-edit"></i></button>
                </td>
            `;
            stockTableBody.appendChild(row);
        });
    }

    function updateStats() {
        const totalItems = products.length;
        const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
        const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minLevel).length;
        const outOfStockItems = products.filter(p => p.stock <= 0).length;

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('inventoryValue').textContent = `${inventoryValue.toLocaleString('ar-EG')} ج.م`;
        document.getElementById('lowStockItems').textContent = lowStockItems;
        document.getElementById('outOfStockItems').textContent = outOfStockItems;
    }

    // --- Initial Load ---
    loadStock();
    updateStats();
});
