document.addEventListener('DOMContentLoaded', () => {
    // التأكد من أننا في صفحة لوحة التحكم
    if (document.querySelector('.dashboard-content')) {
        loadDashboardData();
        renderSalesChart();
    }
});

function loadDashboardData() {
    // بيانات افتراضية
    const data = {
        totalSales: 52350.75,
        totalOrders: 128,
        totalProducts: 74,
        totalCustomers: 45,
        recentOrders: [
            { id: 'INV-001', customer: 'أحمد علي', amount: 1500, status: 'paid' },
            { id: 'INV-002', customer: 'سارة محمود', amount: 850, status: 'pending' },
            { id: 'INV-003', customer: 'محمد حسن', amount: 2300, status: 'paid' },
            { id: 'INV-004', customer: 'فاطمة خالد', amount: 450, status: 'cancelled' },
        ],
        topProducts: [
            { name: 'لابتوب Dell XPS', sold: 15, image: 'https://source.unsplash.com/random/100x100?laptop' },
            { name: 'شاشة Samsung 27"', sold: 22, image: 'https://source.unsplash.com/random/100x100?monitor' },
            { name: 'كيبورد ميكانيكي', sold: 35, image: 'https://source.unsplash.com/random/100x100?keyboard' },
        ]
    };

    // تحديث بطاقات الإحصائيات
    document.getElementById('totalSales').textContent = `${data.totalSales.toLocaleString('ar-EG')} ج.م`;
    document.getElementById('totalOrders').textContent = data.totalOrders;
    document.getElementById('totalProducts').textContent = data.totalProducts;
    document.getElementById('totalCustomers').textContent = data.totalCustomers;

    // تحديث جدول أحدث الطلبات
    const recentOrdersBody = document.getElementById('recentOrders');
    recentOrdersBody.innerHTML = '';
    data.recentOrders.forEach(order => {
        const statusClasses = {
            paid: 'paid',
            pending: 'pending',
            cancelled: 'cancelled'
        };
        const statusText = {
            paid: 'مدفوع',
            pending: 'معلق',
            cancelled: 'ملغي'
        };

        const row = `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.amount.toLocaleString('ar-EG')} ج.م</td>
                <td><span class="status-badge ${statusClasses[order.status]}">${statusText[order.status]}</span></td>
            </tr>
        `;
        recentOrdersBody.innerHTML += row;
    });

    // تحديث قائمة المنتجات الأكثر مبيعاً
    const topProductsList = document.getElementById('topProducts');
    topProductsList.innerHTML = '';
    data.topProducts.forEach(product => {
        const item = `
            <div class="product-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <p>تم بيع ${product.sold} وحدة</p>
                </div>
            </div>
        `;
        topProductsList.innerHTML += item;
    });
}

function renderSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    const salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [{
                label: 'المبيعات',
                data: [1200, 1900, 3000, 5000, 2300, 3200, 4500],
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ar-EG') + ' ج.م';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
