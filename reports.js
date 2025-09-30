document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('salesReportChart')) return;

    // --- Data Management ---
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const customers = JSON.parse(localStorage.getItem('customers')) || [];

    let salesChart, profitChart;

    // --- Functions ---
    function generateReports() {
        // 1. Sales Report Chart (Bar Chart)
        const salesByMonth = sales.reduce((acc, sale) => {
            const month = new Date(sale.date).toLocaleString('default', { month: 'long' });
            acc[month] = (acc[month] || 0) + sale.total;
            return acc;
        }, {});

        if (salesChart) salesChart.destroy();
        salesChart = new Chart(document.getElementById('salesReportChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(salesByMonth),
                datasets: [{
                    label: 'إجمالي المبيعات',
                    data: Object.values(salesByMonth),
                    backgroundColor: '#4f46e5',
                }]
            }
        });

        // 2. Profit Report (Doughnut Chart)
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalCost = sales.flatMap(s => s.items).reduce((sum, item) => {
            const product = products.find(p => p.id == item.productId);
            return sum + ((product ? product.purchasePrice : 0) * item.quantity);
        }, 0);
        const totalProfit = totalRevenue - totalCost;

        if (profitChart) profitChart.destroy();
        profitChart = new Chart(document.getElementById('profitReportChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['إجمالي الربح', 'إجمالي التكلفة'],
                datasets: [{
                    data: [totalProfit, totalCost],
                    backgroundColor: ['#10b981', '#ef4444'],
                }]
            }
        });

        // 3. Top Selling Products
        const productSales = sales.flatMap(s => s.items).reduce((acc, item) => {
            acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
            return acc;
        }, {});
        const sortedProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topProductsReport = document.getElementById('topProductsReport');
        topProductsReport.innerHTML = sortedProducts.map(([name, qty]) => `<div class="product-item"><strong>${name}</strong><span> - ${qty} وحدة</span></div>`).join('');

        // 4. Top Customers
        const customerSales = sales.reduce((acc, sale) => {
            acc[sale.customerName] = (acc[sale.customerName] || 0) + sale.total;
            return acc;
        }, {});
        const sortedCustomers = Object.entries(customerSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topCustomersReport = document.getElementById('topCustomersReport');
        topCustomersReport.innerHTML = sortedCustomers.map(([name, total]) => `<div class="product-item"><strong>${name}</strong><span> - ${total.toLocaleString('ar-EG')} ج.م</span></div>`).join('');
    }

    // --- Initial Load ---
    generateReports();

    document.getElementById('generateReportBtn').addEventListener('click', generateReports);
});
