document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('transactionsTableBody')) return;

    // --- Data Management ---
    let sales = JSON.parse(localStorage.getItem('sales')) || [];
    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    // In a real app, you'd have separate expenses, but we'll simulate with purchases.

    // --- Element References ---
    const transactionsTableBody = document.getElementById('transactionsTableBody');
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

    // --- Core Functions ---
    function loadFinancialSummary() {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalExpenses = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
        const netProfit = totalRevenue - totalExpenses;

        document.getElementById('totalRevenue').textContent = `${totalRevenue.toLocaleString('ar-EG')} ج.م`;
        document.getElementById('totalExpenses').textContent = `${totalExpenses.toLocaleString('ar-EG')} ج.م`;
        document.getElementById('netProfit').textContent = `${netProfit.toLocaleString('ar-EG')} ج.م`;
        // Bank balance would be a more complex calculation
        document.getElementById('bankBalance').textContent = `~ ${netProfit.toLocaleString('ar-EG')} ج.م`;
    }

    function loadTransactions() {
        transactionsTableBody.innerHTML = '';
        const transactions = [];

        // Convert sales to transactions
        sales.forEach(s => {
            transactions.push({
                date: s.date,
                id: s.id,
                type: 'إيراد',
                account: 'المبيعات',
                description: `فاتورة مبيعات للعميل ${s.customerName}`,
                debit: '',
                credit: s.total
            });
        });

        // Convert purchases to transactions
        purchases.forEach(p => {
            transactions.push({
                date: p.date,
                id: p.id,
                type: 'مصروف',
                account: 'المشتريات',
                description: `فاتورة مشتريات من ${p.supplierName}`,
                debit: p.total,
                credit: ''
            });
        });

        // Sort transactions by date
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (transactions.length === 0) {
            transactionsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد معاملات مالية.</td></tr>';
            return;
        }

        transactions.forEach(trans => {
            const row = `
                <tr>
                    <td>${trans.date}</td>
                    <td>${trans.id}</td>
                    <td>${trans.type}</td>
                    <td>${trans.account}</td>
                    <td>${trans.description}</td>
                    <td>${trans.debit ? trans.debit.toLocaleString('ar-EG') + ' ج.م' : '-'}</td>
                    <td>${trans.credit ? trans.credit.toLocaleString('ar-EG') + ' ج.م' : '-'}</td>
                    <td class="action-buttons">
                        <button class="btn-view"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            `;
            transactionsTableBody.innerHTML += row;
        });
    }

    // --- Initial Load ---
    loadFinancialSummary();
    loadTransactions();
});
