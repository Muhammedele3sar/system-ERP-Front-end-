document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('customersTableBody')) return;

    // --- Element References ---
    const newCustomerBtn = document.getElementById('newCustomerBtn');
    const customerModal = document.getElementById('customerModal');
    const customerForm = document.getElementById('customerForm');
    const customersTableBody = document.getElementById('customersTableBody');
    const customerModalTitle = document.getElementById('customerModalTitle');

    // --- Data Management ---
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    const saveCustomers = () => localStorage.setItem('customers', JSON.stringify(customers));

    // --- Event Listeners ---
    newCustomerBtn.addEventListener('click', () => {
        customerForm.reset();
        customerForm.dataset.mode = 'add';
        delete customerForm.dataset.id;
        customerModalTitle.textContent = 'إضافة عميل جديد';
        openModal('customerModal');
    });

    customerForm.addEventListener('submit', e => {
        e.preventDefault();
        saveCustomer();
    });

    customersTableBody.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const customerId = button.closest('tr').dataset.id;

        if (button.classList.contains('btn-edit')) {
            editCustomer(customerId);
        }
        if (button.classList.contains('btn-delete')) {
            deleteCustomer(customerId);
        }
    });

    // --- Core Functions ---
    function saveCustomer() {
        const customerData = {
            id: customerForm.dataset.id || `C${Date.now()}`,
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            address: document.getElementById('customerAddress').value,
        };

        if (customerForm.dataset.mode === 'edit') {
            const index = customers.findIndex(c => c.id === customerData.id);
            if (index !== -1) customers[index] = customerData;
        } else {
            customers.push(customerData);
        }

        saveCustomers();
        alert('تم حفظ العميل بنجاح!');
        closeModal('customerModal');
        loadCustomers();
    }

    function loadCustomers() {
        customersTableBody.innerHTML = '';
        if (customers.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">لا يوجد عملاء. الرجاء إضافة عميل جديد.</td></tr>';
            return;
        }

        customers.forEach(c => {
            const row = document.createElement('tr');
            row.dataset.id = c.id;
            row.innerHTML = `
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.phone || '-'}</td>
                <td>${c.email || '-'}</td>
                <td class="action-buttons">
                    <button class="btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            `;
            customersTableBody.appendChild(row);
        });
    }

    function editCustomer(customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        customerForm.reset();
        customerForm.dataset.mode = 'edit';
        customerForm.dataset.id = customer.id;

        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerEmail').value = customer.email;
        document.getElementById('customerAddress').value = customer.address;
        
        customerModalTitle.textContent = 'تعديل بيانات العميل';
        openModal('customerModal');
    }

    function deleteCustomer(customerId) {
        if (confirm(`هل أنت متأكد من حذف هذا العميل؟`)) {
            customers = customers.filter(c => c.id !== customerId);
            saveCustomers();
            loadCustomers();
        }
    }

    // --- Initial Load ---
    loadCustomers();
});