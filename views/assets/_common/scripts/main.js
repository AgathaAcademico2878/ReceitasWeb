// =====================================================
//  INICIALIZAÇÃO
//  Ponto de entrada — carrega após todos os módulos
// =====================================================

function init() {
    buildNav();
    redirectToLoginIfNeeded();
    handlePageProtection();
    setupLoginForm();
    setupRegisterForm();
    setupContactForm();
    setupFaqPage();
    setupProfilePage();
    setupProfileEditor();
    setupDashboardPage();
    setupFeedPage();
    setupAdminDashboard();
    setupAdminFaqEditor();
    setupGestaoPage();
}

document.addEventListener('DOMContentLoaded', init);