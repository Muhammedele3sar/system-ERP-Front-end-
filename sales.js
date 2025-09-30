document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('salesTableBody')) return;

    const newSaleBtn = document.getElementById('newSaleBtn');
    const saleModal = document.getElementById('saleModal');
    const saleForm = document.getElementById('saleForm');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsTableBody = document.getElementById('itemsTableBody');
    const salesTableBody = document.getElementById('salesTableBody');

    // --- Data Management (using LocalStorage) ---
    let sales = JSON.parse(localStorage.getItem('sales')) || [];
    let products = JSON.parse(localStorage.getItem('products')) || [{ id: 1, name: 'لابتوب Dell', price: 25000, stock: 10 }, { id: 2, name: 'شاشة Samsung', price: 4500, stock: 25 }];
    let customers = JSON.parse(localStorage.getItem('customers')) || [{ id: 1, name: 'أحمد علي' }, { id: 2, name: 'سارة محمود' }];

    const saveSales = () => localStorage.setItem('sales', JSON.stringify(sales));

    // --- Modal and Form Handling ---
    newSaleBtn.addEventListener('click', () => {
        saleForm.reset();
        saleForm.dataset.mode = 'add';
        delete saleForm.dataset.id;
        itemsTableBody.innerHTML = '';
        updateTotals();
        document.getElementById('invoiceNumber').value = `INV-${Date.now().toString().slice(-6)}`;
        document.getElementById('saleDate').valueAsDate = new Date();
        populateSelect('customer', customers);
        openModal('saleModal');
    });

    addItemBtn.addEventListener('click', addSaleItemRow);

    // --- Event Delegation for Dynamic Elements ---
    itemsTableBody.addEventListener('change', handleItemChange);
    itemsTableBody.addEventListener('click', handleItemDelete);
    salesTableBody.addEventListener('click', handleSaleAction);

    document.getElementById('discount').addEventListener('input', updateTotals);

    saleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSale();
    });

    // --- Core Functions ---
    function addSaleItemRow(item = null) {
        const row = document.createElement('tr');
        const isEditing = item !== null;
        row.innerHTML = `
            <td>
                <select class="product-select" required>
                    <option value="">اختر المنتج</option>
                    ${products.map(p => `<option value="${p.id}" data-price="${p.price}" ${isEditing && p.id == item.productId ? 'selected' : ''}>${p.name} (المتاح: ${p.stock})</option>`).join('')}
                </select>
            </td>
            <td><input type="number" class="quantity" value="${isEditing ? item.quantity : 1}" min="1" required></td>
            <td><input type="number" class="price" value="${isEditing ? item.price.toFixed(2) : '0.00'}" readonly></td>
            <td class="item-total">${isEditing ? (item.price * item.quantity).toFixed(2) : '0.00'}</td>
            <td><button type="button" class="btn-delete-item"><i class="fas fa-trash"></i></button></td>
        `;
        itemsTableBody.appendChild(row);
    }

    function handleItemChange(e) {
        if (e.target.classList.contains('product-select') || e.target.classList.contains('quantity')) {
            const row = e.target.closest('tr');
            const productSelect = row.querySelector('.product-select');
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const price = parseFloat(selectedOption.dataset.price) || 0;
            const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
            
            row.querySelector('.price').value = price.toFixed(2);
            row.querySelector('.item-total').textContent = (price * quantity).toFixed(2);
            updateTotals();
        }
    }

    function handleItemDelete(e) {
        if (e.target.closest('.btn-delete-item')) {
            e.target.closest('tr').remove();
            updateTotals();
        }
    }

    function handleSaleAction(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const saleId = button.closest('tr').dataset.id;

        if (button.classList.contains('btn-edit')) {
            editSale(saleId);
        }
        if (button.classList.contains('btn-delete')) {
            deleteSale(saleId);
        }
        if (button.classList.contains('btn-view')) {
            viewSale(saleId);
        }
    }

    function updateTotals() {
        let subtotal = 0;
        itemsTableBody.querySelectorAll('tr').forEach(row => {
            subtotal += parseFloat(row.querySelector('.item-total').textContent) || 0;
        });

        const tax = subtotal * 0.14;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const grandTotal = subtotal + tax - discount;

        document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} ج.م`;
        document.getElementById('tax').textContent = `${tax.toFixed(2)} ج.م`;
        document.getElementById('grandTotal').textContent = `${grandTotal.toFixed(2)} ج.م`;
    }

    function saveSale() {
        const grandTotalText = document.getElementById('grandTotal').textContent;
        const grandTotal = parseFloat(grandTotalText.replace(/[^0-9.-]+/g, ""));

        const saleData = {
            id: document.getElementById('invoiceNumber').value,
            date: document.getElementById('saleDate').value,
            customerId: document.getElementById('customer').value,
            customerName: document.getElementById('customer').options[document.getElementById('customer').selectedIndex].text,
            paymentMethod: document.getElementById('paymentMethod').value,
            items: [],
            subtotal: parseFloat(document.getElementById('subtotal').textContent.replace(/[^0-9.-]+/g, "")),
            tax: parseFloat(document.getElementById('tax').textContent.replace(/[^0-9.-]+/g, "")),
            discount: parseFloat(document.getElementById('discount').value) || 0,
            total: grandTotal,
            status: 'pending', // Default status
            notes: document.getElementById('notes').value,
        };

        itemsTableBody.querySelectorAll('tr').forEach(row => {
            const productSelect = row.querySelector('.product-select');
            saleData.items.push({
                productId: productSelect.value,
                productName: productSelect.options[productSelect.selectedIndex].text.split(' (')[0],
                quantity: parseFloat(row.querySelector('.quantity').value),
                price: parseFloat(row.querySelector('.price').value),
            });
        });

        if (saleForm.dataset.mode === 'edit') {
            const index = sales.findIndex(s => s.id === saleForm.dataset.id);
            if (index !== -1) sales[index] = saleData;
        } else {
            sales.push(saleData);
        }
        
        saveSales();
        alert('تم حفظ الفاتورة بنجاح!');
        closeModal('saleModal');
        loadSales();
    }

    function loadSales() {
        salesTableBody.innerHTML = '';
        if (sales.length === 0) {
            salesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد فواتير مبيعات حالياً.</td></tr>';
            return;
        }

        sales.forEach(sale => {
            const statusClasses = { paid: 'paid', pending: 'pending', cancelled: 'cancelled' };
            const statusText = { paid: 'مدفوع', pending: 'معلق', cancelled: 'ملغي' };

            const row = document.createElement('tr');
            row.dataset.id = sale.id;
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${sale.date}</td>
                <td>${sale.customerName}</td>
                <td>${sale.total.toLocaleString('ar-EG')} ج.م</td>
                <td><span class="status-badge ${statusClasses[sale.status]}">${statusText[sale.status]}</span></td>
                <td class="action-buttons">
                    <button class="btn-view" title="عرض"><i class="fas fa-eye"></i></button>
                    <button class="btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            `;
            salesTableBody.appendChild(row);
        });
    }

    function editSale(saleId) {
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;

        saleForm.reset();
        saleForm.dataset.mode = 'edit';
        saleForm.dataset.id = sale.id;

        document.getElementById('invoiceNumber').value = sale.id;
        document.getElementById('saleDate').value = sale.date;
        populateSelect('customer', customers, sale.customerId);
        document.getElementById('paymentMethod').value = sale.paymentMethod;
        document.getElementById('discount').value = sale.discount;
        document.getElementById('notes').value = sale.notes;

        itemsTableBody.innerHTML = '';
        sale.items.forEach(item => addSaleItemRow(item));
        updateTotals();
        openModal('saleModal');
    }

    function deleteSale(saleId) {
        if (confirm(`هل أنت متأكد من حذف الفاتورة رقم ${saleId}؟`)) {
            sales = sales.filter(s => s.id !== saleId);
            saveSales();
            loadSales();
        }
    }

    function viewSale(saleId) {
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;
        alert(`عرض تفاصيل الفاتورة ${saleId}\nالعميل: ${sale.customerName}\nالإجمالي: ${sale.total.toLocaleString('ar-EG')} ج.م`);
    }

    function populateSelect(elementId, data, selectedValue = null) {
        const select = document.getElementById(elementId);
        select.innerHTML = `<option value="">اختر...</option>`;
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            if (selectedValue && item.id == selectedValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    // Initial Load
    loadSales();
});