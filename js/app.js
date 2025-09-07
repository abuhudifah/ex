document.addEventListener('DOMContentLoaded', function() {
    // التحقق من تسجيل الدخول
    if (!localStorage.getItem('loggedInUser')) {
        if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
    } else {
        if (window.location.pathname.endsWith('index.html')) {
            // إعادة التوجيه حسب نوع المستخدم
            const user = localStorage.getItem('loggedInUser');
            if (user === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }

    // صفحة تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');

            // التحقق من بيانات الدخول
            if ((username === 'admin' && password === 'admin123') || 
                (AGENTS.includes(username) && password === '123456')) {
                localStorage.setItem('loggedInUser', username);
                if (username === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                errorDiv.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            }
        });
    }

    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });
    }

    // لوحة المندوب
    if (window.location.pathname.includes('dashboard.html')) {
        initDashboard();
    }

    // لوحة الإدارة
    if (window.location.pathname.includes('admin.html')) {
        initAdminPanel();
    }
});

function initDashboard() {
    const user = localStorage.getItem('loggedInUser');
    document.querySelector('.navbar h2').textContent = `لوحة المندوب: ${user}`;

    // تحميل قائمة العملاء
    const clientSelect = document.getElementById('clientName');
    CLIENTS.forEach(client => {
        const option = document.createElement('option');
        option.value = client;
        option.textContent = client;
        clientSelect.appendChild(option);
    });

    // تبديل التبويبات
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // إظهار/إخفاء حقل النثريات
    const clearanceType = document.getElementById('clearanceType');
    const expenseItemGroup = document.getElementById('expenseItemGroup');
    clearanceType.addEventListener('change', function() {
        if (this.value === 'نثريات') {
            expenseItemGroup.style.display = 'block';
        } else {
            expenseItemGroup.style.display = 'none';
        }
    });

    // البحث عن عميل
    const searchInput = document.getElementById('searchClient');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterClients(this.value);
        });
    }

    // تحميل المستحقات
    loadReceivables();

    // إدخال تحصيل جديد
    const collectionForm = document.getElementById('collectionForm');
    collectionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const client = document.getElementById('clientName').value;
        const amount = parseFloat(document.getElementById('collectedAmount').value);
        const operationType = document.getElementById('operationType').value;
        const notes = document.getElementById('notes').value;
        const agent = localStorage.getItem('loggedInUser');

        // إضافة التحصيل
        const collection = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            client,
            amount,
            operationType,
            agent,
            notes
        };
        collections.push(collection);

        // تحديث المستحقات
        updateReceivables(client, amount);

        // حفظ البيانات
        saveData();

        // إعادة تعيين النموذج
        collectionForm.reset();
        alert('تم تسجيل التحصيل بنجاح!');
    });

    // إدخال إخلاء جديد
    const clearanceForm = document.getElementById('clearanceForm');
    clearanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = document.getElementById('clearanceType').value;
        const amount = parseFloat(document.getElementById('clearanceAmount').value);
        const details = document.getElementById('clearanceDetails').value;
        const expenseItem = document.getElementById('expenseItem')?.value || '';
        const agent = localStorage.getItem('loggedInUser');

        // إضافة الإخلاء
        const clearance = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type,
            amount,
            agent,
            details,
            expenseItem
        };
        clearances.push(clearance);

        // حفظ البيانات
        saveData();

        // إعادة تعيين النموذج
        clearanceForm.reset();
        alert('تم تسجيل الإخلاء بنجاح!');
    });
}

function loadReceivables() {
    const tableBody = document.querySelector('#clientsTable tbody');
    tableBody.innerHTML = '';

    receivables.forEach(receivable => {
        const row = document.createElement('tr');
        
        // تطبيق الألوان حسب التاريخ
        const dueDate = new Date(receivable.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
            row.classList.add('overdue');
        } else if (dueDate.getTime() === today.getTime()) {
            row.classList.add('due-today');
        }

        row.innerHTML = `
            <td>${receivable.client}</td>
            <td>${receivable.amount.toLocaleString()} ريال</td>
            <td>${receivable.dueDate}</td>
            <td>${receivable.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

function filterClients(searchTerm) {
    const tableBody = document.querySelector('#clientsTable tbody');
    tableBody.innerHTML = '';

    const filtered = receivables.filter(r => 
        r.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(receivable => {
        const row = document.createElement('tr');
        
        const dueDate = new Date(receivable.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
            row.classList.add('overdue');
        } else if (dueDate.getTime() === today.getTime()) {
            row.classList.add('due-today');
        }

        row.innerHTML = `
            <td>${receivable.client}</td>
            <td>${receivable.amount.toLocaleString()} ريال</td>
            <td>${receivable.dueDate}</td>
            <td>${receivable.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateReceivables(client, collectedAmount) {
    // البحث عن مستحق لهذا العميل
    const existingReceivable = receivables.find(r => r.client === client && r.status === 'مفتوح');
    
    if (existingReceivable) {
        if (collectedAmount >= existingReceivable.amount) {
            // تم التحصيل الكامل
            existingReceivable.status = 'مسوّى';
        } else {
            // تم التحصيل الجزئي
            existingReceivable.amount -= collectedAmount;
        }
    } else {
        // لا يوجد مستحق - يمكن إنشاء واحد إذا أردت
        // أو تجاهله كما طلبت (يبدأ من الصفر)
    }
}

function initAdminPanel() {
    const user = localStorage.getItem('loggedInUser');
    document.querySelector('.navbar h2').textContent = `لوحة الإدارة`;

    // حساب التقرير اليومي
    const today = new Date().toISOString().split('T')[0];
    const todayCollections = collections.filter(c => c.date === today);
    const todayClearances = clearances.filter(c => c.date === today);

    const totalCollection = todayCollections.reduce((sum, c) => sum + c.amount, 0);
    const totalDeposits = todayClearances
        .filter(c => c.type === 'إيداع بنكي')
        .reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = todayClearances
        .filter(c => c.type === 'نثريات')
        .reduce((sum, c) => sum + c.amount, 0);
    const remainingBalance = totalCollection - (totalDeposits + totalExpenses);

    // عرض التقرير
    document.getElementById('totalCollection').textContent = `${totalCollection.toLocaleString()} ريال`;
    document.getElementById('totalDeposits').textContent = `${totalDeposits.toLocaleString()} ريال`;
    document.getElementById('totalExpenses').textContent = `${totalExpenses.toLocaleString()} ريال`;
    document.getElementById('remainingBalance').textContent = `${remainingBalance.toLocaleString()} ريال`;

    // تقرير المندوبين
    const agentsReportBody = document.querySelector('#agentsReport tbody');
    agentsReportBody.innerHTML = '';

    AGENTS.forEach(agent => {
        const agentCollections = collections.filter(c => c.agent === agent && c.date === today);
        const agentClearances = clearances.filter(c => c.agent === agent && c.date === today);
        
        const agentTotalCollection = agentCollections.reduce((sum, c) => sum + c.amount, 0);
        const agentTotalDeposits = agentClearances
            .filter(c => c.type === 'إيداع بنكي')
            .reduce((sum, c) => sum + c.amount, 0);
        const agentTotalExpenses = agentClearances
            .filter(c => c.type === 'نثريات')
            .reduce((sum, c) => sum + c.amount, 0);
        const agentRemainingBalance = agentTotalCollection - (agentTotalDeposits + agentTotalExpenses);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${agent}</td>
            <td>${agentTotalCollection.toLocaleString()} ريال</td>
            <td>${agentTotalDeposits.toLocaleString()} ريال</td>
            <td>${agentTotalExpenses.toLocaleString()} ريال</td>
            <td>${agentRemainingBalance.toLocaleString()} ريال</td>
        `;
        agentsReportBody.appendChild(row);
    });

    // تصدير كـ PDF (سيتم تنفيذه لاحقًا)
    const exportPDFBtn = document.getElementById('exportPDF');
    exportPDFBtn.addEventListener('click', function() {
        alert('تم تصدير التقرير كـ PDF!');
        // هنا يمكنك إضافة مكتبة jsPDF لتصدير حقيقي
    });
}
