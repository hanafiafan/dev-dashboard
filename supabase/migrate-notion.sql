-- ============================================================
--  Notion → Dev Dashboard migration
--  Source: Projects + Tasks CSV (Notion export, WORK DASHBOARD AFAN)
--  Run in: Supabase → SQL Editor → New query → Run
--  Idempotent: ON CONFLICT DO NOTHING (aman dijalankan ulang).
--
--  Mapping status project : Done→Completed · In Progress→In Progress
--                           Not Started→Planning · Blocked→On Hold
--  Mapping status task    : Done→Done · To Do→Todo · In progress→In Progress
--  Progress               : Completed=100, selain itu = %task Done,
--                           In Progress tanpa task = 50
-- ============================================================

-- ---------- PROJECTS (18) ----------
insert into public.projects (id, "name", emoji, status, priority, "startDate", deadline, "techStack", client, progress, description, "repoUrl", "figmaUrl", "stagingUrl", "isPublic") values
('n_p1_auditbenihseribuan', 'Audit benihseribuan.co.id', 'web', 'Completed', 'High', '2026-04-01', null, '{}', 'Mas Bayu', 100, 'Melakukan evaluasi menyeluruh terhadap performa website, struktur SEO, dan fungsionalitas teknis benihseribuan.co.id untuk meningkatkan user experience dan efisiensi konversi.', '', '', '', true),
('n_p2_learningaboutnotio', 'Learning About Notion', 'book', 'Completed', 'High', '2026-04-11', null, '{}', 'Mas Feri', 100, 'Belajar bersama tentang aplikasi Notion dari pengenalan aplikasi, pengenalan fitur, hingga setup database dan pengenalan notion 2.0', '', '', '', true),
('n_p3_erp', 'ERP', 'box', 'On Hold', 'Medium', null, null, '{}', 'Mas Feri', 0, 'Pembangunan sistem terintegrasi untuk mengelola berbagai operasional bisnis inti secara otomatis, mulai dari inventaris, pengadaan, hingga laporan keuangan dalam satu platform.', '', '', '', true),
('n_p4_chatbothallohrd', 'ChatBot HalloHRD', 'cpu', 'On Hold', 'Medium', null, null, '{}', 'Mas Feri', 100, 'Pengembangan asisten virtual berbasis AI untuk mengotomatisasi layanan informasi SDM, seperti tanya jawab seputar kebijakan perusahaan, pengajuan cuti, dan rekrutmen awal.', '', '', '', true),
('n_p5_automasiendtoendcs', 'Automasi End to End CS Web by WA', 'server', 'On Hold', 'Low', null, null, '{}', 'Mas Dhika', 100, 'Pengembangan alur kerja otomatis dari website langsung ke WhatsApp untuk menangani permintaan pelanggan secara end-to-end, mulai dari tanya jawab hingga penyelesaian tiket dukungan.', '', '', '', true),
('n_p6_datavisualizationw', 'Data Visualization Web App', 'chart', 'Planning', 'Low', null, null, '{}', 'Mas Andre', 0, 'Membangun aplikasi web interaktif yang berfungsi mengubah data mentah menjadi dasbor visual yang mudah dipahami guna mendukung pengambilan keputusan strategis yang cepat.', '', '', '', true),
('n_p7_lark', 'LARK', 'work', 'On Hold', 'High', '2026-04-08', null, '{}', 'Mas Feri', 100, 'Implementasi atau integrasi sistem kolaborasi kerja LARK untuk meningkatkan produktivitas tim melalui manajemen dokumen, komunikasi internal, dan pengaturan jadwal yang terpusat.', '', '', '', true),
('n_p8_lms', 'LMS', 'book', 'Planning', 'Medium', null, null, '{}', 'Mas Feri', 0, 'Pengembangan sistem manajemen pembelajaran berbasis web untuk memfasilitasi distribusi materi edukasi, pelacakan progres pengguna, dan manajemen kuis/sertifikasi secara daring.', '', '', '', true),
('n_p9_bugpixeldoubletrac', 'Bug Pixel Double Tracking', 'code', 'Completed', 'High', '2026-04-01', null, '{}', 'Mas Radinta', 100, 'Melakukan investigasi dan perbaikan masalah double-tracking pada Meta Pixel. Fokus pada konfigurasi Google Tag Manager untuk memastikan data konversi akurat dan tidak terjadi duplikasi pengiriman event dari sisi klien maupun server.', '', '', '', true),
('n_p10_landingpage', 'Landing Page', 'web', 'Planning', 'Medium', null, null, '{}', 'Mas Bayu', 0, 'Merancang dan membangun halaman arahan yang dioptimalkan untuk konversi tinggi, memastikan desain yang responsif serta pesan yang selaras dengan kampanye pemasaran Mas Bayu.', '', '', '', true),
('n_p11_naturagrowlanding', 'Natura grow Landing Page', 'web', 'Planning', 'Medium', null, null, '{}', 'Mas Dodik', 100, 'http://orderonline.id/ adalah platform berbasis web (SaaS) yang dirancang sebagai solusi "All-in-One" untuk membantu pebisnis online dan UMKM di Indonesia mengelola seluruh proses penjualan dalam satu dashboard.', '', '', '', true),
('n_p12_migrasibenihserib', 'MIGRASI BENIHSERIBUAN.CO.ID', 'server', 'In Progress', 'High', '2026-04-17', null, '{}', 'Mas Bayu', 50, 'Migrasi web http://benihseribuan.co.id dari WordPress ke self development.', '', '', '', true),
('n_p13_fixawbissuerajaon', 'FIX AWB ISSUE RAJAONGKIR', 'code', 'In Progress', 'High', '2026-05-11', null, '{}', 'Mba Pepe', 50, 'Tidak bisa melakukan cetak resi di Ginee, kemungkinan API shipping gateway gagal men-generate AWB.', '', '', '', true),
('n_p14_editctawatrigger', 'edit CTA & WA trigger di web wp BSB', 'web', 'Completed', 'Medium', '2026-05-13', null, '{}', 'Mba Niswa', 100, 'Mengganti email dan WA & trigger di web benihseribuan.co.id.', '', '', '', true),
('n_p15_mengatasipayment', 'Mengatasi masalah Payment issue claude', 'bank', 'In Progress', 'High', '2026-05-15', null, '{}', 'Mas Yefta', 50, 'Gagal menautkan kartu dan melakukan langganan di plan Claude.', '', '', '', true),
('n_p16_optimalisasilooke', 'optimalisasi Looker Studio', 'chart', 'In Progress', 'Medium', '2026-05-12', null, '{}', 'Mba Fuadah', 50, 'Melakukan setup dan konfigurasi di spreadsheet untuk dihubungkan ke Looker Studio secara optimal.', '', '', '', true),
('n_p17_pengembanganaiage', 'pengembangan AI agent untuk HAN', 'cpu', 'In Progress', 'Medium', '2026-05-10', null, '{}', 'Mas Aziz', 50, 'Melakukan pembimbingan untuk setup dan konfigurasi n8n sesuai kebutuhan tiap tim / personal.', '', '', '', true),
('n_p18_productdigitaltre', 'PRODUCT DIGITAL TREADS', 'cart', 'In Progress', 'Medium', null, null, '{}', '', 50, '', '', '', '', true)
on conflict (id) do nothing;

-- ---------- TASKS (24) ----------
insert into public.tasks (id, "projectId", "name", status, priority, "dueDate", "estimatedHours", notes) values
('n_t01_konsultasilark',   'n_p7_lark',                'Konsultasi dengan tim marketing Lark',               'Done', 'Medium', null, 0, ''),
('n_t02_demoteslark',      'n_p7_lark',                'Demo Tes LARK',                                      'Done', 'High',   null, 0, ''),
('n_t03_pembersihanpixel', 'n_p9_bugpixeldoubletrac',  'Pembersihan Meta Pixel di GTM',                      'Done', 'High',   null, 0, ''),
('n_t04_debugeventmgr',    'n_p9_bugpixeldoubletrac',  'Debug Event Manager Duplication',                    'Done', 'High',   null, 0, ''),
('n_t05_analisisseo',      'n_p1_auditbenihseribuan',  'Analisis Struktur SEO On-Page',                      'Done', 'Medium', null, 0, ''),
('n_t06_fixmobileresp',    'n_p1_auditbenihseribuan',  'Fix Mobile Responsiveness Issue',                    'Done', 'Medium', null, 0, ''),
('n_t07_setupdatabase',    'n_p1_auditbenihseribuan',  'Setup Database',                                     'Done', 'Medium', null, 0, ''),
('n_t08_setupwebhookwa',   'n_p5_automasiendtoendcs',  'Setup Webhook WhatsApp API',                         'Done', 'Low',    null, 0, ''),
('n_t09_mappingchatbot',   'n_p4_chatbothallohrd',     'Mapping Flow Chatbot HalloHRD',                      'Done', 'Low',    null, 0, ''),
('n_t10_desainuidata',     'n_p10_landingpage',        'Desain UI Data',                                     'Todo', 'Low',    null, 0, 'Juga terkait: Natura grow Landing Page'),
('n_t11_addintromelody',   'n_p7_lark',                'Add & Intro dengan Melody Yuan',                     'Done', 'High',   null, 0, ''),
('n_t12_wireframingcopy',  'n_p1_auditbenihseribuan',  'Wireframing & Copywriting',                          'Done', 'High',   null, 0, ''),
('n_t13_integrasipayment', 'n_p1_auditbenihseribuan',  'Integrasi Payment Gateway',                          'Done', 'High',   null, 0, ''),
('n_t14_manage1700db',     'n_p1_auditbenihseribuan',  'Manage 1700+ Database Request',                      'Done', 'Medium', null, 0, ''),
('n_t15_addthanksorder',   'n_p1_auditbenihseribuan',  'ADD Thanks Order Page',                              'Done', 'High',   null, 0, ''),
('n_t16_manage12url',      'n_p1_auditbenihseribuan',  'Manage 12 Url Dump',                                 'Done', 'High',   null, 0, ''),
('n_t17_addevenpurchase',  'n_p9_bugpixeldoubletrac',  'Add Even Purchase',                                  'Done', 'High',   null, 0, ''),
('n_t18_migrasidatakomun', 'n_p7_lark',                'Migrasi Data Komunikasi Internal',                   'Done', 'High',   null, 0, ''),
('n_t19_setupautomasiapp', 'n_p7_lark',                'Setup Automasi Approval Workflow',                   'Done', 'High',   null, 0, ''),
('n_t20_configcrmapi',     'n_p7_lark',                'Config CRM Integration API',                         'Done', 'High',   null, 0, ''),
('n_t21_analisischeckout', 'n_p11_naturagrowlanding',  'Analisis efektifitas checkout page orderonline.id',  'Done', 'Medium', null, 0, ''),
('n_t22_createprd',        'n_p11_naturagrowlanding',  'Create PRD',                                         'Done', 'High',   null, 0, ''),
('n_t23_ceksmtpbenih',     'n_p1_auditbenihseribuan',  'cek SMTP benihseribuan',                             'Done', 'High',   null, 0, ''),
('n_t24_fixissuexendit',   'n_p1_auditbenihseribuan',  'FIX issue payment Xendit',                           'Done', 'High',   null, 0, '')
on conflict (id) do nothing;

-- ---------- VERIFIKASI ----------
select 'projects' as tabel, count(*) as total from public.projects where id like 'n\_p%' escape '\'
union all
select 'tasks', count(*) from public.tasks where id like 'n\_t%' escape '\';
