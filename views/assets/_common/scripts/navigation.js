// =====================================================
//  NAVEGAÇÃO E PROTEÇÃO DE PÁGINAS
// =====================================================

/** Cria um item <li> com link para o menu de navegação */
function createNavLink(link) {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.textContent = link.text;
    anchor.href = link.href;
    if (link.action) anchor.addEventListener('click', link.action);
    li.appendChild(anchor);
    return li;
}

/** Monta o menu de navegação conforme papel do usuário (admin, logado, visitante) */
function buildNav() {
    const navList = document.querySelector('.main-nav ul');
    if (!navList) return;

    const links = [];
    links.push({ href: resolvePath('public', 'index.html'), text: 'Home' });

    if (isUserLogged()) {
        links.push({ href: resolvePath('app', 'feed.html'), text: 'Feed' });
        links.push({ href: resolvePath('app', 'profile.html'), text: 'Perfil' });
    }

    if (!isAdmin()) {
        links.push({ href: resolvePath('public', 'contact.html'), text: 'Contato' });
        links.push({ href: resolvePath('public', 'faq.html'), text: 'FAQ' });
    }

    if (isAdmin()) {
        links.push({ href: resolvePath('admin', 'dashboard.html'), text: 'Mensagens' });
        links.push({ href: resolvePath('admin', 'faqs.html'), text: 'Editar FAQ' });
        links.push({ href: resolvePath('admin', 'gestao.html'), text: 'Gestão' });
    }

    if (isUserLogged()) {
        links.push({ href: '#', text: 'Sair', action: logout });
    } else {
        links.push({ href: resolvePath('public', 'login.html'), text: 'Login' });
        if (PAGE_TYPE === 'public') links.push({ href: 'register.html', text: 'Cadastro' });
    }

    navList.innerHTML = '';
    links.forEach(link => navList.appendChild(createNavLink(link)));
}

/** Redireciona o botão "Ir para o Feed" para feed ou login */
function redirectToLoginIfNeeded() {
    const button = document.querySelector('#go-feed');
    if (!button) return;
    button.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = isUserLogged() ? resolvePath('app', 'feed.html') : resolvePath('public', 'login.html');
    });
}

/** Protege páginas: redireciona conforme status de login e tipo de página */
function handlePageProtection() {
    const page = window.location.pathname.split('/').pop().toLowerCase();
    const isLogin = page === 'login.html';
    const isRegister = page === 'register.html';
    const isHome = page === 'index.html' || page === '';
    const publicPages = ['index.html', 'about.html', 'contact.html', 'faq.html', 'login.html', 'register.html'];
    const isPublicPage = publicPages.includes(page);

    if (isUserLogged() && (isLogin || isRegister)) {
        window.location.href = resolvePath('app', 'feed.html');
        return;
    }

    if (!isUserLogged() && !isHome && !isPublicPage) {
        window.location.href = resolvePath('public', 'login.html');
        return;
    }

    if (PAGE_TYPE === 'admin' && !isAdmin()) {
        window.location.href = isUserLogged() ? resolvePath('app', 'feed.html') : resolvePath('public', 'login.html');
    }
}