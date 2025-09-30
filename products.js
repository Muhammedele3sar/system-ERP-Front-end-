document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('productsTableBody')) return;

    // --- Element References ---
    const newProductBtn = document.getElementById('newProductBtn');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const productsTableBody = document.getElementById('productsTableBody');
    const productModalTitle = document.getElementById('productModalTitle');

    // --- Data Management ---
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const saveProducts = () => localStorage.setItem('products', JSON.stringify(products));

    // --- Event Listeners ---
    newProductBtn.addEventListener('click', () => {
        productForm.reset();
        productForm.dataset.mode = 'add';
        delete productForm.dataset.id;
        productModalTitle.textContent = 'إضافة منتج جديد';
        openModal('productModal');
    });

    productForm.addEventListener('submit', e => {
        e.preventDefault();
        saveProduct();
    });

    productsTableBody.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const productId = button.closest('tr').dataset.id;

        if (button.classList.contains('btn-edit')) {
            editProduct(productId);
        }
        if (button.classList.contains('btn-delete')) {
            deleteProduct(productId);
        }
    });

    // --- Core Functions ---
    function saveProduct() {
        const productData = {
            id: productForm.dataset.id || `P${Date.now()}`,
            name: document.getElementById('productName').value,
            purchasePrice: parseFloat(document.getElementById('purchasePrice').value),
            salePrice: parseFloat(document.getElementById('salePrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            minLevel: parseInt(document.getElementById('minLevel').value),
            warehouse: document.getElementById('productWarehouse').value,
        };

        if (productForm.dataset.mode === 'edit') {
            const index = products.findIndex(p => p.id === productData.id);
            if (index !== -1) products[index] = productData;
        } else {
            products.push(productData);
        }

        saveProducts();
        alert('تم حفظ المنتج بنجاح!');
        closeModal('productModal');
        loadProducts();
    }

    function loadProducts() {
        productsTableBody.innerHTML = '';
        if (products.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد منتجات. الرجاء إضافة منتج جديد.</td></tr>';
            return;
        }

        products.forEach(p => {
            const row = document.createElement('tr');
            row.dataset.id = p.id;
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.warehouse}</td>
                <td>${p.stock}</td>
                <td>${p.purchasePrice.toLocaleString('ar-EG')} ج.م</td>
                <td>${p.salePrice.toLocaleString('ar-EG')} ج.م</td>
                <td class="action-buttons">
                    <button class="btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    }

    function editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        productForm.reset();
        productForm.dataset.mode = 'edit';
        productForm.dataset.id = product.id;

        document.getElementById('productName').value = product.name;
        document.getElementById('purchasePrice').value = product.purchasePrice;
        document.getElementById('salePrice').value = product.salePrice;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('minLevel').value = product.minLevel;
        document.getElementById('productWarehouse').value = product.warehouse;
        
        productModalTitle.textContent = 'تعديل المنتج';
        openModal('productModal');
    }

    function deleteProduct(productId) {
        if (confirm(`هل أنت متأكد من حذف المنتج؟ سيتم حذفه نهائياً.`)) {
            products = products.filter(p => p.id !== productId);
            saveProducts();
            loadProducts();
        }
    }

    // --- Initial Load ---
    loadProducts();
});
