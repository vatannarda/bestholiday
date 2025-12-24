export const translations = {
    tr: {
        // Common
        common: {
            loading: "Yükleniyor...",
            refresh: "Yenile",
            save: "Kaydet",
            cancel: "İptal",
            search: "Ara...",
            filter: "Filtrele",
            export: "Excel'e Aktar",
            all: "Tümü",
            income: "Gelir",
            expense: "Gider",
            balance: "Bakiye",
            date: "Tarih",
            description: "Açıklama",
            category: "Kategori",
            subCategory: "Alt Kategori",
            amount: "Tutar",
            type: "Tür",
            currency: "Para Birimi",
            liveData: "Canlı Veri",
        },

        // Navigation
        nav: {
            overview: "Genel Bakış",
            transactions: "İşlemler",
            aiAnalyst: "AI Analist",
            users: "Kullanıcılar",
            activity: "Loglar",
            myPanel: "Panelim",
            addTransaction: "İşlem Ekle",
            logout: "Çıkış Yap",
            management: "Yönetim",
        },

        // Login
        login: {
            welcome: "Hoş Geldiniz",
            subtitle: "Hesabınıza giriş yaparak devam edin",
            admin: "Yönetici",
            worker: "Personel",
            username: "Kullanıcı Adı",
            password: "Şifre",
            adminLogin: "Yönetici Girişi",
            workerLogin: "Personel Girişi",
            loggingIn: "Giriş yapılıyor...",
            loginFailed: "Giriş başarısız",
            demo: "Demo",
        },

        // Dashboard
        dashboard: {
            title: "Genel Bakış",
            lastUpdate: "Son güncelleme",
            totalIncome: "Toplam Gelir",
            totalExpense: "Toplam Gider",
            netBalance: "Net Bakiye",
            quickAdd: "Hızlı İşlem Ekle",
            quickAddDesc: "Yapay zeka ile doğal dilde işlem ekleyin",
            writeNaturally: "İşlemi Doğal Dilde Yazın",
            placeholder: "Örn: Bugün Ahmet'e 500 TL mazot parası verdim",
            webhookNote: "n8n webhook'u yazınızı analiz edip veritabanına kaydedecektir.",
            saveWithAI: "AI ile Kaydet",
            sending: "Gönderiliyor...",
            weeklyStats: "Haftalık Finansal Durum",
            weeklyDesc: "Bu haftanın gelir ve gider karşılaştırması",
            expenseDist: "Gider Dağılımı",
            expenseDistDesc: "Kategorilere göre gider oranları",
            recentTrans: "Son İşlemler",
            recentTransDesc: "Webhook'tan alınan son finansal hareketler",
            noTransactions: "Henüz işlem bulunmuyor.",
        },

        // Worker Dashboard
        worker: {
            welcome: "Hoş geldin",
            welcomeDesc: "AI ile doğal dilde işlem ekleyebilirsin.",
            last10: "Webhook'tan alınan son 10 işlem",
        },

        // Transactions Page
        transactions: {
            title: "Tüm İşlemler",
            adminDesc: "Webhook'tan alınan tüm finansal hareketler",
            userDesc: "İşlemlerinizi görüntüleyin",
            noResults: "İşlem bulunamadı.",
            incomes: "Gelirler",
            expenses: "Giderler",
            createdBy: "İşlemi Giren",
        },

        // AI Chat
        chat: {
            title: "AI Finans Asistanı",
            desc: "Finansal verileriniz hakkında sorular sorun",
            welcome: "Merhaba! Ben BestHoliday Finans Asistanınızım. Size finansal verileriniz hakkında sorular sorabilirsiniz.",
            placeholder: "Mesajınızı yazın...",
            send: "Gönder",
            attach: "Dosya Ekle",
            voice: "Sesli Mesaj",
            suggestions: "Önerilen Sorular",
        },

        // Sidebar
        sidebar: {
            quickLook: "Hızlı Bakış",
            recentActivity: "Son Aktivite",
            noActivity: "Henüz aktivite yok",
            loadingData: "Veri yükleniyor...",
            connectionError: "Veri alınamadı",
        },

        // Toasts
        toast: {
            success: "İşlem Başarıyla Eklendi",
            refreshing: "Veriler yenileniyor...",
            error: "Hata",
            saveFailed: "İşlem kaydedilemedi.",
            connectionError: "Bağlantı Hatası",
            serverError: "Sunucuya bağlanılamadı.",
            dataUpdated: "Veriler Güncellendi",
            dataLoadError: "Veri Yükleme Hatası",
            dataLoadFailed: "Veriler alınamadı, tekrar deneyiniz.",
            transactionsLoaded: "işlem yüklendi",
        },

        // Theme
        theme: {
            toggle: "Tema değiştir",
            light: "Açık",
            dark: "Koyu",
            system: "Sistem",
        },

        // Language
        language: {
            toggle: "Dil değiştir",
            tr: "Türkçe",
            en: "English",
        },

        // Currencies
        currencies: {
            TRY: "Türk Lirası",
            USD: "Amerikan Doları",
            EUR: "Euro",
        },

        // Users Management
        users: {
            title: "Kullanıcı Yönetimi",
            subtitle: "Sistemdeki tüm kullanıcıları yönetin",
            addUser: "Kullanıcı Ekle",
            username: "Kullanıcı Adı",
            displayName: "Görünen Ad",
            role: "Rol",
            status: "Durum",
            actions: "İşlemler",
            active: "Aktif",
            inactive: "Pasif",
            admin: "Yönetici",
            financeAdmin: "Finans Yöneticisi",
            financeUser: "Finans Personeli",
            worker: "Personel",
            deleteConfirm: "Bu kullanıcıyı silmek istediğinize emin misiniz?",
            deleteWarning: "Bu işlem geri alınamaz.",
            delete: "Sil",
            toggle: "Durumu Değiştir",
            noUsers: "Henüz kullanıcı bulunmuyor.",
            createSuccess: "Kullanıcı başarıyla oluşturuldu",
            deleteSuccess: "Kullanıcı başarıyla silindi",
            toggleSuccess: "Kullanıcı durumu güncellendi",
            password: "Şifre",
            create: "Oluştur",
        },

        // Activity Logs
        activity: {
            title: "Aktivite Logları",
            subtitle: "Sistemdeki tüm işlemleri görüntüleyin",
            date: "Tarih",
            user: "Kullanıcı",
            action: "İşlem",
            details: "Detay",
            noLogs: "Henüz aktivite kaydı bulunmuyor.",
        },

        // Master Panel
        masterPanel: {
            title: "Yönetim Paneli",
            subtitle: "İş süreçlerinizi yöneten modüllere erişin",
            productName: "BestHoliday • Finance Operations",
            modules: "Modüller",
            modulesDesc: "İş süreçlerinizi yöneten modüllere erişin",
            activeModules: "Aktif Modüller",
            comingSoon: "Yakında",
            active: "Aktif",
            selectModule: "Modül Seçin",
            accountingModule: "Muhasebe Modülü",
            accountingDesc: "Cari hesaplar, vade takibi ve finansal hareketler yönetimi",
            transferModule: "Transfer Sistemi",
            transferDesc: "Araç, personel ve operasyon yönetimi",
            demoMode: "Demo Verisi",
        },

        // Accounting Module
        accounting: {
            title: "Muhasebe Modülü",
            overview: "Finansal Özet",
            overviewDesc: "Tüm cari hesaplarınızın bakiye durumu ve finansal performans",
            entities: "Cari Hesaplar",
            entitiesDesc: "Müşteri, otel ve araç sahipleriyle olan finansal ilişkilerinizi yönetin",
            ledger: "Hesap Hareketleri",
            ledgerDesc: "Alacak, borç ve ödeme kayıtlarının tam listesi",
            due: "Vade Takibi",
            dueDesc: "Yaklaşan ve gecikmiş ödemeleri takip edin, ödeme takvimini planlayın",
            totalReceivable: "Toplam Alacak",
            totalPayable: "Toplam Borç",
            netBalance: "Net Bakiye",
            overdueCount: "Gecikmiş Ödemeler",
            upcomingDue: "Yaklaşan Vadeler",
            quickLinks: "Hızlı Erişim",
            entityCount: "Toplam Cari",
        },

        // Entities
        entities: {
            title: "Cari Hesaplar",
            subtitle: "Müşteri, otel ve araç sahipleriyle olan finansal ilişkilerinizi yönetin",
            customers: "Müşteriler",
            hotels: "Oteller",
            vehicleOwners: "Araç Sahipleri",
            subAgencies: "Alt Acentalar",
            addEntity: "Yeni Cari Hesap Oluştur",
            entityCode: "Cari Kodu",
            entityName: "Cari Adı",
            contactName: "İlgili Kişi",
            phone: "Telefon",
            email: "E-posta",
            tags: "Etiketler",
            notes: "Notlar",
            noEntities: "Henüz cari hesap oluşturulmadı. İlk müşterinizi ekleyerek finansal takibi başlatın.",
            createSuccess: "Cari hesap başarıyla oluşturuldu",
            balanceSummary: "Bakiye Özeti",
            accountMovements: "Hesap Hareketleri",
        },

        // Ledger
        ledger: {
            title: "Hesap Hareketleri",
            subtitle: "Alacak, borç ve ödeme kayıtlarının tam listesi",
            addEntry: "Yeni Finansal Hareket Ekle",
            movementType: "Hareket Türü",
            receivable: "Alacak",
            payable: "Borç",
            income: "Gelir",
            expense: "Gider",
            status: "Durum",
            planned: "Planlandı",
            pending: "Beklemede",
            paid: "Ödendi",
            overdue: "Gecikmiş",
            dueDate: "Vade Tarihi",
            reference: "Referans",
            operationId: "Operasyon ID",
            operationIdHint: "Rezervasyon veya operasyon kodu (örn: REZ-2024-001)",
            markAsPaid: "Ödeme Tamamlandı Olarak İşaretle",
            noEntries: "Bu hesaba ait hareket bulunmuyor. Yeni bir alacak veya borç kaydı oluşturabilirsiniz.",
            createSuccess: "Hareket başarıyla eklendi",
        },

        // Due (Vade Takibi)
        dueTracking: {
            title: "Vade Takibi",
            subtitle: "Yaklaşan ve gecikmiş ödemeleri takip edin, ödeme takvimini planlayın",
            upcoming: "Yaklaşan Ödemeler",
            overduePayments: "Gecikmiş Ödemeler",
            daysUntilDue: "Kalan Gün",
            daysOverdue: "Gecikme Süresi",
            addNote: "Not Ekle",
            noUpcoming: "Önümüzdeki 7 gün içinde vadesi dolacak ödeme bulunmuyor.",
            noOverdue: "Gecikmiş ödeme bulunmuyor. Tüm ödemeleriniz güncel.",
            filterDays: "Gün Filtresi",
            next7Days: "7 Gün İçinde",
            next14Days: "14 Gün İçinde",
            next30Days: "30 Gün İçinde",
        },

        // Errors & Access
        errors: {
            title: "Bir Hata Oluştu",
            description: "Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
            connectionError: "Bağlantı hatası. Sunucu ile iletişim kurulamadı.",
            retry: "Tekrar Dene",
            goHome: "Ana Sayfaya Dön",
            accessDenied: "Erişim Kısıtlı",
            accessDeniedDesc: "Bu alana erişim yetkiniz bulunmamaktadır. Farklı bir modüle yönlendirilmek için aşağıdaki butonu kullanabilirsiniz.",
            notFound: "Sayfa Bulunamadı",
            notFoundDesc: "Aradığınız sayfa mevcut değil veya taşınmış olabilir.",
        },
    },

    en: {
        // Common
        common: {
            loading: "Loading...",
            refresh: "Refresh",
            save: "Save",
            cancel: "Cancel",
            search: "Search...",
            filter: "Filter",
            export: "Export to Excel",
            all: "All",
            income: "Income",
            expense: "Expense",
            balance: "Balance",
            date: "Date",
            description: "Description",
            category: "Category",
            subCategory: "Subcategory",
            amount: "Amount",
            type: "Type",
            currency: "Currency",
            liveData: "Live Data",
        },

        // Navigation
        nav: {
            overview: "Overview",
            transactions: "Transactions",
            aiAnalyst: "AI Analyst",
            users: "Users",
            activity: "Logs",
            myPanel: "My Panel",
            addTransaction: "Add Transaction",
            logout: "Logout",
            management: "Management",
        },

        // Login
        login: {
            welcome: "Welcome",
            subtitle: "Sign in to your account to continue",
            admin: "Admin",
            worker: "Staff",
            username: "Username",
            password: "Password",
            adminLogin: "Admin Login",
            workerLogin: "Staff Login",
            loggingIn: "Signing in...",
            loginFailed: "Login failed",
            demo: "Demo",
        },

        // Dashboard
        dashboard: {
            title: "Overview",
            lastUpdate: "Last update",
            totalIncome: "Total Income",
            totalExpense: "Total Expense",
            netBalance: "Net Balance",
            quickAdd: "Quick Add Transaction",
            quickAddDesc: "Add transactions using natural language with AI",
            writeNaturally: "Write Transaction in Natural Language",
            placeholder: "E.g.: Today I gave Ahmet 500 TL for fuel",
            webhookNote: "n8n webhook will analyze your text and save to database.",
            saveWithAI: "Save with AI",
            sending: "Sending...",
            weeklyStats: "Weekly Financial Status",
            weeklyDesc: "This week's income and expense comparison",
            expenseDist: "Expense Distribution",
            expenseDistDesc: "Expense ratios by category",
            recentTrans: "Recent Transactions",
            recentTransDesc: "Latest financial activities from webhook",
            noTransactions: "No transactions yet.",
        },

        // Worker Dashboard
        worker: {
            welcome: "Welcome",
            welcomeDesc: "You can add transactions using natural language with AI.",
            last10: "Last 10 transactions from webhook",
        },

        // Transactions Page
        transactions: {
            title: "All Transactions",
            adminDesc: "All financial activities from webhook",
            userDesc: "View your transactions",
            noResults: "No transactions found.",
            incomes: "Incomes",
            expenses: "Expenses",
            createdBy: "Created By",
        },

        // AI Chat
        chat: {
            title: "AI Finance Assistant",
            desc: "Ask questions about your financial data",
            welcome: "Hello! I'm your BestHoliday Finance Assistant. You can ask me questions about your financial data.",
            placeholder: "Type your message...",
            send: "Send",
            attach: "Attach File",
            voice: "Voice Message",
            suggestions: "Suggested Questions",
        },

        // Sidebar
        sidebar: {
            quickLook: "Quick Look",
            recentActivity: "Recent Activity",
            noActivity: "No activity yet",
            loadingData: "Loading data...",
            connectionError: "Could not load data",
        },

        // Toasts
        toast: {
            success: "Transaction Added Successfully",
            refreshing: "Refreshing data...",
            error: "Error",
            saveFailed: "Failed to save transaction.",
            connectionError: "Connection Error",
            serverError: "Could not connect to server.",
            dataUpdated: "Data Updated",
            dataLoadError: "Data Load Error",
            dataLoadFailed: "Could not load data, please try again.",
            transactionsLoaded: "transactions loaded",
        },

        // Theme
        theme: {
            toggle: "Toggle theme",
            light: "Light",
            dark: "Dark",
            system: "System",
        },

        // Language
        language: {
            toggle: "Change language",
            tr: "Türkçe",
            en: "English",
        },

        // Currencies
        currencies: {
            TRY: "Turkish Lira",
            USD: "US Dollar",
            EUR: "Euro",
        },

        // Users Management
        users: {
            title: "User Management",
            subtitle: "Manage all system users",
            addUser: "Add User",
            username: "Username",
            displayName: "Display Name",
            role: "Role",
            status: "Status",
            actions: "Actions",
            active: "Active",
            inactive: "Inactive",
            admin: "Admin",
            financeAdmin: "Finance Manager",
            financeUser: "Finance Staff",
            worker: "Staff",
            deleteConfirm: "Are you sure you want to delete this user?",
            deleteWarning: "This action cannot be undone.",
            delete: "Delete",
            toggle: "Toggle Status",
            noUsers: "No users found.",
            createSuccess: "User created successfully",
            deleteSuccess: "User deleted successfully",
            toggleSuccess: "User status updated",
            password: "Password",
            create: "Create",
        },

        // Activity Logs
        activity: {
            title: "Activity Logs",
            subtitle: "View all system activities",
            date: "Date",
            user: "User",
            action: "Action",
            details: "Details",
            noLogs: "No activity logs found.",
        },

        // Master Panel
        masterPanel: {
            title: "Admin Panel",
            subtitle: "Access modules that manage your business processes",
            productName: "BestHoliday • Finance Operations",
            modules: "Modules",
            modulesDesc: "Access modules that manage your business processes",
            activeModules: "Active Modules",
            comingSoon: "Coming Soon",
            active: "Active",
            selectModule: "Select Module",
            accountingModule: "Accounting Module",
            accountingDesc: "Account management, due tracking, and financial transactions",
            transferModule: "Transfer System",
            transferDesc: "Vehicle, staff, and operation management",
            demoMode: "Demo Data",
        },

        // Accounting Module
        accounting: {
            title: "Accounting Module",
            overview: "Financial Summary",
            overviewDesc: "Balance status and financial performance of all accounts",
            entities: "Accounts",
            entitiesDesc: "Manage financial relationships with customers, hotels, and vehicle owners",
            ledger: "Ledger",
            ledgerDesc: "Complete list of receivable, payable, and payment records",
            due: "Due Tracking",
            dueDesc: "Track upcoming and overdue payments, plan payment schedule",
            totalReceivable: "Total Receivable",
            totalPayable: "Total Payable",
            netBalance: "Net Balance",
            overdueCount: "Overdue Payments",
            upcomingDue: "Upcoming Dues",
            quickLinks: "Quick Access",
            entityCount: "Total Accounts",
        },

        // Entities
        entities: {
            title: "Accounts",
            subtitle: "Customer, hotel, and supplier accounts",
            customers: "Customers",
            hotels: "Hotels",
            vehicleOwners: "Vehicle Owners",
            subAgencies: "Sub Agencies",
            addEntity: "Add Account",
            entityCode: "Account Code",
            entityName: "Account Name",
            contactName: "Contact Person",
            phone: "Phone",
            email: "Email",
            tags: "Tags",
            notes: "Notes",
            noEntities: "No accounts found. Start by adding a new account.",
            createSuccess: "Account created successfully",
            balanceSummary: "Balance Summary",
            accountMovements: "Account Movements",
        },

        // Ledger
        ledger: {
            title: "Account Movements",
            addEntry: "Add Entry",
            movementType: "Movement Type",
            receivable: "Receivable",
            payable: "Payable",
            income: "Income",
            expense: "Expense",
            status: "Status",
            planned: "Planned",
            pending: "Pending",
            paid: "Paid",
            overdue: "Overdue",
            dueDate: "Due Date",
            reference: "Reference",
            operationId: "Operation ID",
            operationIdHint: "Reservation or operation code (e.g., REZ-2024-001)",
            markAsPaid: "Mark as Paid",
            noEntries: "No entries found.",
            createSuccess: "Entry added successfully",
        },

        // Due (Due Tracking)
        dueTracking: {
            title: "Due Tracking",
            subtitle: "Track upcoming and overdue payments, plan payment schedule",
            upcoming: "Upcoming Payments",
            overduePayments: "Overdue Payments",
            daysUntilDue: "Days Left",
            daysOverdue: "Days Overdue",
            addNote: "Add Note",
            noUpcoming: "No payments due within the next 7 days.",
            noOverdue: "No overdue payments. All payments are up to date.",
            filterDays: "Filter by Days",
            next7Days: "Next 7 Days",
            next14Days: "Next 14 Days",
            next30Days: "Next 30 Days",
        },

        // Errors & Access
        errors: {
            title: "An Error Occurred",
            description: "There was a problem loading the data. Please try again.",
            connectionError: "Connection error. Could not communicate with server.",
            retry: "Try Again",
            goHome: "Go to Home",
            accessDenied: "Access Restricted",
            accessDeniedDesc: "You do not have permission to access this area. Use the button below to navigate to a different module.",
            notFound: "Page Not Found",
            notFoundDesc: "The page you are looking for does not exist or may have been moved.",
        },
    },
} as const

export type Language = keyof typeof translations
export type TranslationKeys = typeof translations.tr
