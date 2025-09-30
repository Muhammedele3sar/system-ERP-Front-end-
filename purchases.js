document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('purchasesTableBody')) return;

    const newPurchaseBtn = document.getElementById('newPurchaseBtn');
    const purchaseForm = document.getElementById('purchaseForm');
    const purchasesTableBody = document.getElementById('purchasesTableBody');
    const addPurchaseItemBtn = document.getElementById('addPurchaseItemBtn');
    const purchaseItemsTableBody = document.getElementById('purchaseItemsTableBody');

    // --- Data Management (using LocalStorage) ---
    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [{id: 1, name: 'شركة النور للتوريدات'}, {id: 2, name: 'مؤسسة الأمل التجارية'}];

    const savePurchases = () => localStorage.setItem('purchases', JSON.stringify(purchases));

    // --- Modal and Form Handling ---
    newPurchaseBtn.addEventListener('click', () => {
        purchaseForm.reset();
        purchaseForm.dataset.mode = 'add';
        delete purchaseForm.dataset.id;
        purchaseItemsTableBody.innerHTML = '';
        updatePurchaseTotals();
        document.getElementById('invoiceNumber').value = `PUR-${Date.now().toString().slice(-6)}`;
        document.getElementById('purchaseDate').valueAsDate = new Date();
        populateSelect('supplier', suppliers);
        openModal('purchaseModal');
    });

    addPurchaseItemBtn.addEventListener('click', () => addPurchaseItemRow());

    purchaseForm.addEventListener('submit', e => {
        e.preventDefault();
        savePurchase();
    });

    purchasesTableBody.addEventListener('click', handlePurchaseAction);

    // --- Core Functions ---
    function savePurchase() {
        const grandTotal = parseFloat(document.getElementById('grandTotal').textContent.replace(/[^0-9.-]+/g, ""));

        const purchaseData = {
            id: document.getElementById('invoiceNumber').value,
            date: document.getElementById('purchaseDate').value,
            supplierId: document.getElementById('supplier').value,
            supplierName: document.getElementById('supplier').options[document.getElementById('supplier').selectedIndex].text,
            items: [],
            subtotal: parseFloat(document.getElementById('subtotal').textContent.replace(/[^0-9.-]+/g, "")),
            tax: parseFloat(document.getElementById('tax').textContent.replace(/[^0-9.-]+/g, "")),
            total: grandTotal,
            paid: 0, 
            status: 'unpaid',
        };

        purchaseItemsTableBody.querySelectorAll('tr').forEach(row => {
            purchaseData.items.push({
                productName: row.querySelector('.product-name').value,
                quantity: parseFloat(row.querySelector('.quantity').value),
                price: parseFloat(row.querySelector('.price').value),
            });
        });

        if (purchaseForm.dataset.mode === 'edit') {
            const index = purchases.findIndex(p => p.id === purchaseForm.dataset.id);
            if (index !== -1) purchases[index] = purchaseData;
        } else {
            purchases.push(purchaseData);
        }

        savePurchases();
        alert('تم حفظ فاتورة الشراء بنجاح!');
        closeModal('purchaseModal');
        loadPurchases();
    }

    function loadPurchases() {
        purchasesTableBody.innerHTML = '';
        if (purchases.length === 0) {
            purchasesTableBody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد فواتير مشتريات حالياً.</td></tr>';
            return;
        }

        const statusClasses = { paid: 'paid', partial: 'pending', unpaid: 'cancelled' };
        const statusText = { paid: 'مدفوع', partial: 'جزئي', unpaid: 'غير مدفوع' };

        purchases.forEach(p => {
            const remaining = p.total - p.paid;
            const row = document.createElement('tr');
            row.dataset.id = p.id;
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.date}</td>
                <td>${p.supplierName}</td>
                <td>${p.total.toLocaleString('ar-EG')} ج.م</td>
                <td>${p.paid.toLocaleString('ar-EG')} ج.م</td>
                <td>${remaining.toLocaleString('ar-EG')} ج.م</td>
                <td><span class="status-badge ${statusClasses[p.status]}">${statusText[p.status]}</span></td>
                <td class="action-buttons">
                    <button class="btn-view" title="عرض"><i class="fas fa-eye"></i></button>
                    <button class="btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            `;
            purchasesTableBody.appendChild(row);
        });
    }

    function handlePurchaseAction(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const purchaseId = button.closest('tr').dataset.id;

        if (button.classList.contains('btn-delete')) {
            if (confirm(`هل أنت متأكد من حذف الفاتورة رقم ${purchaseId}؟`)) {
                purchases = purchases.filter(p => p.id !== purchaseId);
                savePurchases();
                loadPurchases();
            }
        }
        // Add edit/view logic here
    }
    
    function addPurchaseItemRow(item = null) {
        const row = document.createElement('tr');
        const isEditing = item !== null;
        row.innerHTML = `
            <td><input type="text" class="product-name" placeholder="اسم المنتج" value="${isEditing ? item.productName : ''}" required></td>
            <td><input type="number" class="quantity" value="${isEditing ? item.quantity : 1}" min="1" required></td>
            <td><input type="number" class="price" placeholder="0.00" value="${isEditing ? item.price.toFixed(2) : ''}" required></td>
            <td class="item-total">${isEditing ? (item.price * item.quantity).toFixed(2) : '0.00'}</td>
            <td><button type="button" class="btn-delete-item"><i class="fas fa-trash"></i></button></td>
        `;
        purchaseItemsTableBody.appendChild(row);
    }

    function updatePurchaseTotals() {
        let subtotal = 0;
        purchaseItemsTableBody.querySelectorAll('tr').forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
            const price = parseFloat(row.querySelector('.price').value) || 0;
            const itemTotal = quantity * price;
            row.querySelector('.item-total').textContent = itemTotal.toFixed(2);
            subtotal += itemTotal;
        });

        const tax = subtotal * 0.14;
        const grandTotal = subtotal + tax;

        document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} ج.م`;
        document.getElementById('tax').textContent = `${tax.toFixed(2)} ج.م`;
        document.getElementById('grandTotal').textContent = `${grandTotal.toFixed(2)} ج.م`;
    }

    purchaseItemsTableBody.addEventListener('input', e => {
        if (e.target.classList.contains('quantity') || e.target.classList.contains('price')) {
            updatePurchaseTotals();
        }
    });

    purchaseItemsTableBody.addEventListener('click', e => {
        if (e.target.closest('.btn-delete-item')) {
            e.target.closest('tr').remove();
            updatePurchaseTotals();
        }
    });

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
    loadPurchases();
});