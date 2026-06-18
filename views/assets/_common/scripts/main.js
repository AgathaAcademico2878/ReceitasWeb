// =====================================================
// Configuração da API
// =====================================================

const API_BASE_URL = window.location.origin + '/ReceitasWeb/api';

function getApiToken() {
    return localStorage.getItem('receitasWebApiToken');
}

function setApiToken(token) {
    localStorage.setItem('receitasWebApiToken', token);
}

function clearApiToken() {
    localStorage.removeItem('receitasWebApiToken');
}

async function apiFetch(endpoint, options = {}) {
    const url = API_BASE_URL + endpoint;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = getApiToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { code: 500, status: 'error', message: 'Erro de conexão com o servidor.' };
    }
}

// =====================================================

const STORAGE_KEYS = {
    user: 'receitasWebUser',
    currentUserId: 'receitasWebCurrentUserId',
    users: 'receitasWebUsers',
    logged: 'receitasWebLogged',
    messages: 'receitasWebMessages',
    faqs: 'receitasWebFaqs',
    posts: 'receitasWebPosts',
    categories: 'receitasWebCategories'
};

const DEFAULT_FAQS = [
    {
        question: 'Como faço cadastro?',
        answer: 'Use o formulário em Cadastro e informe nome, email e senha para criar sua conta.'
    },
    {
        question: 'Preciso fazer login para ver o feed?',
        answer: 'Sim. O feed da área de aplicação é restrito a usuários cadastrados e logados.'
    },
    {
        question: 'Posso alterar meus dados?',
        answer: 'Sim. Após o login, acesse Perfil para atualizar nome, e-mail, senha e outras informações.'
    }
];

const DEFAULT_POSTS = [
    {
        id: 'sample-1',
        title: 'Sopa cremosa de abóbora',
        content: 'Uma sopa quentinha e cremosa para aquecer a noite. Fácil de fazer e perfeita para a família.',
        author: { name: 'Maria Santos', email: 'maria@receitasweb.com.br', isAdmin: false },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        likes: ['sample@user.com'],
        comments: [
            { user: 'João Pedro', message: 'Que delícia! Quero testar no fim de semana.', sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
        ]
    },
    {
        id: 'sample-2',
        title: 'Arroz caramelizado com castanhas',
        content: 'Uma receita doce e crocante que combina com jantares especiais e refeições em família.',
        author: { name: 'João Pedro', email: 'joao@receitasweb.com.br', isAdmin: false },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        likes: [],
        comments: []
    },
    {
        id: 'sample-3',
        title: 'Creme de café com caramelo',
        content: 'Uma sobremesa suave com aroma de café e finalização doce de caramelo.',
        author: { name: 'Laura Ribeiro', email: 'laura@receitasweb.com.br', isAdmin: false },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
        likes: ['sample@user.com'],
        comments: [
            { user: 'Maria Santos', message: 'Ficou linda essa sobremesa!', sentAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() }
        ]
    }
];

function normalizePath(path) {
    return path.replace(/\\/g, '/');
}

function getPageType() {
    const path = normalizePath(window.location.pathname);
    if (path.includes('/views/admin/')) {
        return 'admin';
    }
    if (path.includes('/views/app/')) {
        return 'app';
    }
    return 'public';
}

const PAGE_TYPE = getPageType();

function resolvePath(target, page) {
    if (target === 'public') {
        return PAGE_TYPE === 'public' ? page : `../public/${page}`;
    }
    if (target === 'app') {
        return PAGE_TYPE === 'app' ? page : `../app/${page}`;
    }
    if (target === 'admin') {
        return PAGE_TYPE === 'admin' ? page : `../admin/${page}`;
    }
    return page;
}

const DEFAULT_AVATAR = 'https://i.pinimg.com/474x/a7/d3/9e/a7d39eb1998731d8c45b9a72a376f884.jpg';

function getSafeAvatar(value) {
    const avatar = (value || '').toString().trim();
    return avatar ? avatar : DEFAULT_AVATAR;
}

function getCategoryNameById(categoryId) {
    const categories = getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
}

function getStoredUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setStoredUser(user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function getAllUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (!raw) return [];
    try {
        const users = JSON.parse(raw);
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

function saveAllUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function registerNewUser(userData) {
    const allUsers = getAllUsers();
    const userExists = allUsers.some(u => u.name.toLowerCase() === userData.name.toLowerCase() || u.email.toLowerCase() === userData.email.toLowerCase());
    if (userExists) {
        return false;
    }
    allUsers.push(userData);
    saveAllUsers(allUsers);
    return true;
}

function findUserByName(name) {
    const allUsers = getAllUsers();
    return allUsers.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
}

function findUserByEmail(email) {
    const allUsers = getAllUsers();
    return allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.currentUserId, user.email);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function isUserLogged() {
    return localStorage.getItem(STORAGE_KEYS.logged) === 'true' && getStoredUser() !== null;
}

function currentUser() {
    if (!isUserLogged()) return null;
    const currentUserId = localStorage.getItem(STORAGE_KEYS.currentUserId);
    if (!currentUserId) {
        return getStoredUser();
    }
    return findUserByEmail(currentUserId) || getStoredUser();
}

function isAdmin() {
    return currentUser()?.isAdmin === true;
}

function logout(event) {
    if (event) {
        event.preventDefault();
    }
    localStorage.removeItem(STORAGE_KEYS.logged);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    clearApiToken();
    window.location.href = resolvePath('public', 'login.html');
}

function getMessages() {
    const raw = localStorage.getItem(STORAGE_KEYS.messages);
    return raw ? JSON.parse(raw) : [];
}

function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
}

function addMessage(message) {
    const messages = getMessages();
    messages.unshift(message);
    saveMessages(messages);
}

async function getUserById(userId) {
    try {
        const res = await apiFetch(`/users/list/${userId}`);
        if (res && res.data) return res.data;
    } catch {}
    return null;
}

function transformApiPost(apiPost) {
    let comments = [];
    if (apiPost.comments) {
        try {
            const parsed = typeof apiPost.comments === 'string' ? JSON.parse(apiPost.comments) : apiPost.comments;
            comments = Array.isArray(parsed) ? parsed : [];
        } catch {
            comments = [];
        }
    }
    let likes = [];
    if (apiPost.likes) {
        try {
            const parsed = typeof apiPost.likes === 'string' ? JSON.parse(apiPost.likes) : apiPost.likes;
            likes = Array.isArray(parsed) ? parsed : [];
        } catch {
            likes = [];
        }
    }
    return {
        id: String(apiPost.id),
        title: apiPost.title || '',
        content: apiPost.description || '',
        category_id: apiPost.category_id || null,
        author: { name: apiPost.author_name || 'Usuário', email: apiPost.author_email || '', isAdmin: false },
        authorId: apiPost.user_id ? String(apiPost.user_id) : '',
        createdAt: apiPost.created_at || new Date().toISOString(),
        likes: likes,
        comments: comments.map(function (c) {
            return { user: c.user || c.name || 'Usuário', message: c.message || c.text || '', sentAt: c.sentAt || c.sent_at || new Date().toISOString() };
        })
    };
}

async function syncPosts() {
    try {
        const res = await apiFetch('/publicacoes/list');
        if (res && res.data && Array.isArray(res.data)) {
            const posts = res.data.map(transformApiPost);
            savePosts(posts);
            return posts;
        }
    } catch {}
    return getPosts();
}

async function syncCategories() {
    try {
        const res = await apiFetch('/categorias/list');
        if (res && res.data && Array.isArray(res.data)) {
            saveCategories(res.data);
            return res.data;
        }
    } catch {}
    return getCategories();
}

function getPosts() {
    const raw = localStorage.getItem(STORAGE_KEYS.posts);
    if (!raw) return [];
    try {
        const posts = JSON.parse(raw);
        return Array.isArray(posts) ? posts : [];
    } catch {
        return [];
    }
}

function getAllPosts() {
    return getPosts();
}

function getCategories() {
    const raw = localStorage.getItem(STORAGE_KEYS.categories);
    if (!raw) return [];
    try {
        const categories = JSON.parse(raw);
        return Array.isArray(categories) ? categories : [];
    } catch {
        return [];
    }
}

function saveCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}

function getDefaultCategories() {
    return [
        { id: 1, name: 'Sopas', description: 'Sopas e cremes quentes para dias frios', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 2, name: 'Sobremesas', description: 'Doces e sobremesas para finalizar a refeição', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 3, name: 'Massas', description: 'Pratos de massa italiana e outras variações', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 4, name: 'Saladas', description: 'Saladas frescas e saudáveis para qualquer refeição', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 5, name: 'Bebidas', description: 'Sucos, chás, smoothies e outras bebidas', createdBy: 1, createdAt: new Date().toISOString() }
    ];
}

function getUserPostsKey(user) {
    if (!user) return null;
    const id = (user.email || user.name || '').toString().trim().toLowerCase();
    return id ? `receitasWebPosts_${id}` : null;
}

function getUserPostsFromStorage(user) {
    const key = getUserPostsKey(user);
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        const posts = JSON.parse(raw);
        return Array.isArray(posts) ? posts : null;
    } catch {
        return null;
    }
}

function saveUserPosts(user, posts) {
    const key = getUserPostsKey(user);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(posts));
}

function getUserPosts(user) {
    const allPosts = getPosts();
    if (!user) return [];

    return allPosts.filter(function (post) {
        if (!post || !post.author) return false;
        const authorEmail = (post.author.email || '').toString().trim().toLowerCase();
        return authorEmail === (user.email || '').toString().trim().toLowerCase();
    });
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
}

async function createPost(title, content, categoryId = null) {
    const user = currentUser();
    if (!user) return null;

    const payload = { title: title, description: content, category_id: categoryId || 1 };

    try {
        const res = await apiFetch('/publicacoes', { method: 'POST', body: JSON.stringify(payload) });
        if (res && res.status === 'success') {
            await syncPosts();
        }
    } catch {}

    const posts = getPosts();
    const post = {
        id: Date.now().toString(),
        title,
        content,
        category_id: categoryId,
        author: {
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: getSafeAvatar(user.avatar)
        },
        authorId: (user.email || user.name || '').toString().trim().toLowerCase(),
        createdAt: new Date().toISOString(),
        likes: [],
        comments: []
    };

    posts.unshift(post);
    savePosts(posts);
    const userPosts = getUserPostsFromStorage(user) || [];
    saveUserPosts(user, [post].concat(userPosts));
    return post;
}

async function likePost(postId) {
    const user = currentUser();
    if (!user) return null;

    const posts = getPosts();
    const post = posts.find(item => item.id === postId);
    if (!post) return null;

    const likedIndex = post.likes.indexOf(user.email);
    if (likedIndex !== -1) {
        post.likes.splice(likedIndex, 1);
    } else {
        post.likes.push(user.email);
    }

    savePosts(posts);

    try {
        await apiFetch('/publicacoes/' + postId, { method: 'PUT', body: JSON.stringify({ likes: post.likes }) });
    } catch {}

    return post;
}

async function addCommentToPost(postId, commentText) {
    const user = currentUser();
    if (!user) return null;

    const posts = getPosts();
    const post = posts.find(item => item.id === postId);
    if (!post) return null;

    post.comments.unshift({
        user: user.name,
        message: commentText,
        sentAt: new Date().toISOString()
    });

    savePosts(posts);

    try {
        await apiFetch('/publicacoes/' + postId, { method: 'PUT', body: JSON.stringify({ comments: post.comments }) });
    } catch {}

    return post;
}

let _faqsCache = null;

async function getFaqs() {
    // Tenta buscar da API
    try {
        const result = await apiFetch('/faqs/list');
        if (result.code === 200 && Array.isArray(result.data)) {
            _faqsCache = result.data.map(item => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
                faqs_category_id: item.faqs_category_id
            }));
            return _faqsCache;
        }
    } catch (e) {
        // fallback silencioso
    }

    // Fallback: localStorage
    if (_faqsCache) return _faqsCache;
    const raw = localStorage.getItem(STORAGE_KEYS.faqs);
    if (!raw) {
        return DEFAULT_FAQS.slice();
    }
    try {
        const value = JSON.parse(raw);
        const faqs = Array.isArray(value) ? value : DEFAULT_FAQS.slice();
        _faqsCache = faqs;
        return faqs;
    } catch {
        return DEFAULT_FAQS.slice();
    }
}

async function saveFaqs(faqs) {
    // Salva no localStorage como fallback
    localStorage.setItem(STORAGE_KEYS.faqs, JSON.stringify(faqs));
    _faqsCache = faqs;

    // Tenta salvar via API (requer token de admin)
    const token = getApiToken();
    if (!token) return;

    // Busca FAQs atuais da API para comparar
    try {
        const current = await apiFetch('/faqs/list');
        const existingIds = (current.code === 200 && Array.isArray(current.data))
            ? current.data.map(f => f.id).filter(id => id != null)
            : [];

        for (const faq of faqs) {
            if (faq.id && existingIds.includes(faq.id)) {
                // Atualiza existente
                await apiFetch(`/faqs/${faq.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        question: faq.question,
                        answer: faq.answer,
                        faqs_category_id: faq.faqs_category_id || 1
                    })
                });
            } else {
                // Cria novo
                await apiFetch('/faqs', {
                    method: 'POST',
                    body: JSON.stringify({
                        question: faq.question,
                        answer: faq.answer,
                        faqs_category_id: faq.faqs_category_id || 1
                    })
                });
            }
        }

        // Remove da API os que não estão mais na lista
        const currentIds = faqs.map(f => f.id).filter(id => id != null);
        for (const existingId of existingIds) {
            if (!currentIds.includes(existingId)) {
                await apiFetch(`/faqs/${existingId}`, { method: 'DELETE' });
            }
        }
    } catch (e) {
        console.warn('Erro ao sincronizar FAQs com a API:', e);
    }
}

function createNavLink(link) {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.textContent = link.text;
    anchor.href = link.href;
    if (link.action) {
        anchor.addEventListener('click', link.action);
    }
    li.appendChild(anchor);
    return li;
}

function buildNav() {
    const navList = document.querySelector('.main-nav ul');
    if (!navList) return;

    const links = [];
    links.push({ href: resolvePath('public', 'index.html'), text: 'Home' });

    if (isUserLogged()) {
        links.push({ href: resolvePath('app', 'feed.html'), text: 'Feed' });
        links.push({ href: resolvePath('app', 'profile.html'), text: 'Perfil' });
    }

    // Não exibe a aba 'Contato' nem a aba pública 'FAQ' para administradores logados
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
        if (PAGE_TYPE === 'public') {
            links.push({ href: 'register.html', text: 'Cadastro' });
        }
    }

    navList.innerHTML = '';
    links.forEach(link => navList.appendChild(createNavLink(link)));
}

function redirectToLoginIfNeeded() {
    const button = document.querySelector('#go-feed');
    if (!button) return;

    button.addEventListener('click', function (event) {
        event.preventDefault();
        if (isUserLogged()) {
            window.location.href = resolvePath('app', 'feed.html');
        } else {
            window.location.href = resolvePath('public', 'login.html');
        }
    });
}

function handlePageProtection() {
    const page = window.location.pathname.split('/').pop().toLowerCase();
    const isLogin = page === 'login.html';
    const isRegister = page === 'register.html';
    const isHome = page === 'index.html' || page === '';

    if (isUserLogged() && (isLogin || isRegister)) {
        window.location.href = resolvePath('app', 'feed.html');
        return;
    }

    if (!isUserLogged() && !isHome && !isLogin && !isRegister) {
        window.location.href = resolvePath('public', 'login.html');
        return;
    }

    if (PAGE_TYPE === 'admin' && !isAdmin()) {
        if (isUserLogged()) {
            window.location.href = resolvePath('app', 'feed.html');
        } else {
            window.location.href = resolvePath('public', 'login.html');
        }
    }
}

function setupLoginForm() {
    const loginForm = document.querySelector('#login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('input[name="email"]').value.trim();
        const password = loginForm.querySelector('input[name="password"]').value.trim();

        // Login via API
        const result = await apiFetch('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.code === 200 && result.data) {
            const user = {
                name: result.data.name,
                email: result.data.email,
                id: result.data.id
            };

            // Verifica se é admin
            const adminResult = await apiFetch('/users/login-admin', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            user.isAdmin = (adminResult.code === 200);

            setApiToken(result.data.token);
            setCurrentUser(user);
            localStorage.setItem(STORAGE_KEYS.logged, 'true');
            window.location.href = resolvePath('app', 'feed.html');
            return;
        }

        // Se falhou
        alert('Erro ao fazer login: ' + (result.message || 'Credenciais inválidas.'));
    });
}

function setupRegisterForm() {
    const registerForm = document.querySelector('#register-form');
    if (!registerForm) return;

    // Handle admin toggle showing/hiding password field
    const adminToggle = registerForm.querySelector('#admin-toggle');
    const adminPasswordField = registerForm.querySelector('#admin-password-field');
    if (adminToggle && adminPasswordField) {
        adminToggle.addEventListener('change', function () {
            adminPasswordField.style.display = this.checked ? 'block' : 'none';
            // Clear password when unchecking
            if (!this.checked) {
                const adminPasswordInput = adminPasswordField.querySelector('input[name="admin_password"]');
                if (adminPasswordInput) {
                    adminPasswordInput.value = '';
                }
            }
        });
    }

    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = registerForm.querySelector('input[name="name"]').value.trim();
        const email = registerForm.querySelector('input[name="email"]').value.trim();
        const password = registerForm.querySelector('input[name="password"]').value.trim();
        const adminToggle = registerForm.querySelector('#admin-toggle');
        const adminPasswordInput = registerForm.querySelector('#admin-password');
        const wantsAdmin = adminToggle && adminToggle.checked;

        if (wantsAdmin && adminPasswordInput.value !== 'agatha') {
            alert('Senha de administrador incorreta!');
            return;
        }

        // Cadastro via API — envia type_id para admin
        const body = { name, email, password };
        if (wantsAdmin) {
            body.type_id = 1;
        }

        const result = await apiFetch('/users/register', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (result.code === 201 && result.data) {
            // API cadastro com sucesso — faz login automático
            const loginResult = await apiFetch('/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (loginResult.code === 200 && loginResult.data) {
                setApiToken(loginResult.data.token);
                const user = {
                    name: loginResult.data.name,
                    email: loginResult.data.email,
                    id: loginResult.data.id,
                    isAdmin: wantsAdmin
                };
                setCurrentUser(user);
                localStorage.setItem(STORAGE_KEYS.logged, 'true');
                window.location.href = resolvePath('app', 'feed.html');
                return;
            }
        }

        // Se falhou comunicação com a API
        alert('Erro ao cadastrar: ' + (result.message || 'Não foi possível conectar ao servidor.'));
    });
}

function setupContactForm() {
    const contactForm = document.querySelector('#contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!isUserLogged()) {
            window.location.href = resolvePath('public', 'login.html');
            return;
        }

        const name = contactForm.querySelector('input[name="name"]').value.trim();
        const email = contactForm.querySelector('input[name="email"]').value.trim();
        const messageText = contactForm.querySelector('input[name="message"]').value.trim();

        if (!name || !email || !messageText) {
            alert('Preencha todos os campos.');
            return;
        }

        addMessage({
            name,
            email,
            message: messageText,
            sentAt: new Date().toISOString(),
            user: currentUser()?.name || 'Visitante'
        });

        alert('Mensagem enviada! Obrigado pelo contato.');
        contactForm.reset();
    });
}

function updateUserInStorage(updatedUser) {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => (u.email || '').toLowerCase() === (updatedUser.email || '').toLowerCase());
    if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
        saveAllUsers(allUsers);
    }
    setCurrentUser(updatedUser);
}

function updateAuthorInfoOnPosts(user) {
    const posts = getPosts();
    let changed = false;

    posts.forEach(post => {
        if (post.author && (post.author.email || '').toLowerCase() === (user.email || '').toLowerCase()) {
            post.author.name = user.name;
            post.author.avatar = getSafeAvatar(user.avatar);
            changed = true;
        }
    });

    if (changed) {
        savePosts(posts);
    }
}

function setupProfileEditor() {
    const editButton = document.querySelector('#edit-profile-btn');
    const form = document.querySelector('#edit-profile-form');
    const cancelButton = document.querySelector('#cancel-edit-profile');
    if (!editButton || !form || !cancelButton) return;

    const nameInput = form.querySelector('input[name="name"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const avatarInput = form.querySelector('input[name="avatar"]');
    const bioInput = form.querySelector('textarea[name="bio"]');

    function fillForm() {
        const user = currentUser();
        if (!user) return;
        nameInput.value = user.name;
        passwordInput.value = '';
        avatarInput.value = user.avatar === DEFAULT_AVATAR ? '' : user.avatar;
        bioInput.value = user.bio || '';
    }

    editButton.addEventListener('click', function () {
        fillForm();
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    cancelButton.addEventListener('click', function () {
        form.classList.add('hidden');
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const user = currentUser();
        if (!user) return;

        const name = nameInput.value.trim();
        const password = passwordInput.value.trim();
        const avatar = getSafeAvatar(avatarInput.value.trim());
        const bio = bioInput.value.trim();

        if (!name) {
            alert('O nome não pode ficar em branco.');
            return;
        }

        user.name = name;
        if (password) {
            user.password = password;
        }
        user.avatar = avatar;
        user.bio = bio;

        updateUserInStorage(user);
        updateAuthorInfoOnPosts(user);
        setupProfilePage();
        form.classList.add('hidden');
        alert('Perfil atualizado com sucesso!');
    });
}

function renderPostCard(post, currentUserEmail) {
    const liked = post.likes.includes(currentUserEmail);
    const likeText = liked ? 'Descurtir' : 'Curtir';
    const likeCount = post.likes.length;
    const commentsCount = post.comments.length;

    const postCard = document.createElement('article');
    postCard.className = 'post-card';
    postCard.dataset.postId = post.id;
    postCard.innerHTML = `
        <header class="post-meta">
            <figure>
                <img src="${getSafeAvatar(post.author.avatar)}" alt="Avatar de ${post.author.name}" class="avatar">
                <figcaption>
                    <strong>${post.author.name}</strong>
                    <span>${new Date(post.createdAt).toLocaleString('pt-BR')}</span>
                </figcaption>
            </figure>
        </header>
        <section>
            <h2>${post.title}</h2>
            ${post.category_id ? `<p><strong>Categoria:</strong> ${getCategoryNameById(post.category_id)}</p>` : ''}
            <p>${post.content}</p>
        </section>
        <section class="post-actions">
            <button type="button" class="btn-like${liked ? ' active' : ''}" data-action="like">${likeText} <span class="likes-count">${likeCount}</span></button>
            <button type="button" class="btn-comment" data-action="comment">Comentar</button>
            <span class="comments-count">${commentsCount} comentário${commentsCount === 1 ? '' : 's'}</span>
        </section>
        <form class="comment-form" style="display: none;">
            <input type="text" placeholder="Escreva um comentário...">
            <button type="submit" class="btn">Enviar</button>
        </form>
        <div class="comments"></div>
    `;

    const commentsContainer = postCard.querySelector('.comments');
    post.comments.slice().reverse().forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.innerHTML = `<strong>${comment.user}:</strong> ${comment.message}`;
        commentsContainer.appendChild(commentItem);
    });

    return postCard;
}

async function setupFeedPage() {
    const feedList = document.querySelector('#feed-list');
    const publicationForm = document.querySelector('#publication-form');
    const currentUserEmail = currentUser()?.email;

    if (!feedList || !publicationForm) return;
    if (!currentUserEmail) return;

    await syncPosts();
    await syncCategories();

    function renderFeed() {
        const allPosts = getAllPosts();
        const postsToDisplay = allPosts.length === 0 ? DEFAULT_POSTS : allPosts;

        feedList.innerHTML = '';

        if (postsToDisplay.length === 0) {
            feedList.innerHTML = '<p>Não há publicações ainda. Você pode criar a primeira!</p>';
            return;
        }

        postsToDisplay.forEach(post => {
            feedList.appendChild(renderPostCard(post, currentUserEmail));
        });
    }

    function loadCategories() {
        const categorySelect = publicationForm.querySelector('select[name="category_id"]');
        if (!categorySelect) return;

        const categories = getCategories().length > 0 ? getCategories() : getDefaultCategories();
        categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    const toggleButton = document.querySelector('#new-publication-toggle');
    if (toggleButton && publicationForm) {
        toggleButton.addEventListener('click', function () {
            publicationForm.classList.toggle('hidden');
            if (!publicationForm.classList.contains('hidden')) {
                publicationForm.querySelector('input[name="title"]').focus();
                loadCategories();
            }
        });
    }

    if (publicationForm) {
        publicationForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const title = publicationForm.querySelector('input[name="title"]').value.trim();
            const content = publicationForm.querySelector('textarea[name="content"]').value.trim();
            const categoryId = parseInt(publicationForm.querySelector('select[name="category_id"]').value);

            if (!title || !content) {
                alert('Preencha título e descrição para publicar.');
                return;
            }

            if (isNaN(categoryId) || categoryId <= 0) {
                alert('Selecione uma categoria para a publicação.');
                return;
            }

            await createPost(title, content, categoryId);
            publicationForm.reset();
            renderFeed();
        });
    }

    feedList.addEventListener('click', async function (event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const postCard = button.closest('.post-card');
        if (!postCard) return;
        const postId = postCard.dataset.postId;

        if (button.dataset.action === 'like') {
            await likePost(postId);
            renderFeed();
            return;
        }

        if (button.dataset.action === 'comment') {
            const commentForm = postCard.querySelector('.comment-form');
            if (!commentForm) return;
            commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
            const input = commentForm.querySelector('input');
            if (input) input.focus();
            return;
        }
    });

    feedList.addEventListener('submit', async function (event) {
        const form = event.target.closest('.comment-form');
        if (!form) return;
        event.preventDefault();

        const postId = form.closest('.post-card')?.dataset.postId;
        const input = form.querySelector('input');
        const commentText = input.value.trim();
        if (!postId || !commentText) return;

        await addCommentToPost(postId, commentText);
        renderFeed();
    });

    renderFeed();
}

async function setupFaqPage() {
    const faqContainer = document.querySelector('#faq-list');
    if (!faqContainer) return;

    faqContainer.innerHTML = '<p class="loading">Carregando perguntas frequentes...</p>';
    const faqs = await getFaqs();
    faqContainer.innerHTML = '';
    if (!faqs.length) {
        faqContainer.innerHTML = '<p>Nenhuma pergunta frequente disponível no momento.</p>';
        return;
    }
    faqs.forEach(({ question, answer }) => {
        const item = document.createElement('section');
        item.className = 'faq-item';
        item.innerHTML = `<h2>${question}</h2><p>${answer}</p>`;
        faqContainer.appendChild(item);
    });
}

function createProfilePostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.innerHTML = `
        <header class="post-meta">
            <figure>
                <img src="${getSafeAvatar(post.author.avatar)}" alt="Avatar de ${post.author.name}" class="avatar">
                <figcaption>
                    <strong>${post.author.name}</strong>
                    <span>${new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                </figcaption>
            </figure>
        </header>
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <p><strong>Curtidas:</strong> ${post.likes.length} | <strong>Comentários:</strong> ${post.comments.length}</p>
    `;
    return card;
}

async function setupProfilePage() {
    const profileInfo = document.querySelector('#profile-info');
    const myPostsSection = document.querySelector('#my-posts');
    const likedPostsSection = document.querySelector('#liked-posts');
    if (!profileInfo || !myPostsSection || !likedPostsSection) return;

    const user = currentUser();
    if (!user) return;

    await syncPosts();

    profileInfo.innerHTML = `
        <div class="profile-card">
            <img class="avatar-lg" src="${getSafeAvatar(user.avatar)}" alt="Avatar de ${user.name}">
            <h2>${user.name}</h2>
            <p><strong>Email:</strong> ${user.email}</p>
            <p class="bio">${user.bio ? user.bio : 'Sem bio informada.'}</p>
            <p><strong>Perfil:</strong> ${user.isAdmin ? 'Administrador' : 'Usuário'}</p>
        </div>
    `;

    const allPosts = getAllPosts();
    const myPosts = getUserPosts(user);
    const likedPosts = allPosts.filter(post => post.likes.includes(user.email));

    myPostsSection.innerHTML = '';
    if (myPosts.length === 0) {
        myPostsSection.innerHTML = '<p>Nenhuma publicação criada ainda.</p>';
    } else {
        myPosts.forEach(post => myPostsSection.appendChild(createProfilePostCard(post)));
    }

    likedPostsSection.innerHTML = '';
    if (likedPosts.length === 0) {
        likedPostsSection.innerHTML = '<p>Você ainda não curtiu nenhuma publicação.</p>';
    } else {
        likedPosts.forEach(post => likedPostsSection.appendChild(createProfilePostCard(post)));
    }
}

function setupDashboardPage() {
    const dashboardWelcome = document.querySelector('#dashboard-welcome');
    if (!dashboardWelcome) return;

    const user = currentUser();
    if (!user) return;

    dashboardWelcome.innerHTML = `
        <h1>Bem-vindo, ${user.name}!</h1>
        <p>Use os links do menu para acessar o feed, perfil e as FAQs${user.isAdmin ? ' e Mensagens' : ' e Contato'}.</p>
        <p>${user.isAdmin ? 'Você é administrador e pode editar FAQs e consultar mensagens enviadas pelos usuários.' : 'Você está conectado como usuário comum.'}</p>
    `;
}

function setupAdminDashboard() {
    const messagesContainer = document.querySelector('#message-list');
    if (!messagesContainer) return;

    const messages = getMessages();
    if (!messages || messages.length === 0) {
        messagesContainer.innerHTML = '<p>Nenhuma mensagem recebida ainda.</p>';
        return;
    }

    // ensure messages have a completed flag
    messages.forEach(m => { if (typeof m.completed === 'undefined') m.completed = false; });
    saveMessages(messages);

    const pending = messages.filter(m => !m.completed);
    const completed = messages.filter(m => m.completed);

    messagesContainer.innerHTML = `
        <div class="messages-columns">
            <div class="messages-column" id="pending-messages">
                <h3>Pendentes</h3>
                <div class="messages-list"></div>
            </div>
            <div class="messages-column" id="completed-messages">
                <h3>Concluídas</h3>
                <div class="messages-list"></div>
            </div>
        </div>
    `;

    const pendingList = messagesContainer.querySelector('#pending-messages .messages-list');
    const completedList = messagesContainer.querySelector('#completed-messages .messages-list');

    function createMessageElement(message) {
        const item = document.createElement('div');
        item.className = 'message-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'msg-checkbox';
        checkbox.checked = !!message.completed;
        checkbox.dataset.sentAt = message.sentAt;

        const content = document.createElement('div');
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.innerHTML = `<strong>${message.name}</strong> — <span>${new Date(message.sentAt).toLocaleString('pt-BR')}</span>`;
        const email = document.createElement('div');
        email.className = 'message-meta';
        email.innerHTML = `<strong>Email:</strong> ${message.email}`;
        const body = document.createElement('div');
        body.className = 'message-body';
        body.textContent = message.message;

        content.appendChild(meta);
        content.appendChild(email);
        content.appendChild(body);

        item.appendChild(checkbox);
        item.appendChild(content);
        return item;
    }

    pending.forEach(msg => pendingList.appendChild(createMessageElement(msg)));
    completed.forEach(msg => completedList.appendChild(createMessageElement(msg)));

    // toggle completed state when checkbox changes
    messagesContainer.addEventListener('change', function (event) {
        const checkbox = event.target.closest('.msg-checkbox');
        if (!checkbox) return;
        const sentAt = checkbox.dataset.sentAt;
        const all = getMessages();
        const msg = all.find(m => m.sentAt === sentAt);
        if (!msg) return;
        msg.completed = checkbox.checked;
        saveMessages(all);
        // re-render dashboard messages
        setupAdminDashboard();
    });
}

async function setupAdminFaqEditor() {
    const faqEditor = document.querySelector('#faq-editor');
    if (!faqEditor) return;

    faqEditor.innerHTML = '<p class="loading">Carregando FAQs...</p>';
    const faqs = await getFaqs();
    faqEditor.innerHTML = '';

    faqs.forEach((faq, index) => {
        const item = document.createElement('section');
        item.className = 'faq-item';
        item.innerHTML = `
            <label>
                Pergunta
                <input type="text" data-index="${index}" data-field="question" value="${faq.question.replace(/"/g, '&quot;')}">
            </label>
            <label>
                Resposta
                <textarea data-index="${index}" data-field="answer">${faq.answer}</textarea>
            </label>
            <button type="button" class="btn remove-faq" data-index="${index}">Remover pergunta</button>
        `;
        faqEditor.appendChild(item);
    });

    const actions = document.createElement('div');
    actions.className = 'faq-actions';
    actions.innerHTML = `
        <button type="button" id="save-faqs" class="btn btn-primary">Salvar alterações</button>
        <span id="faq-saving" class="status-message" style="display:none">Salvando...</span>
        <p id="faq-status" class="status-message"></p>
    `;
    faqEditor.appendChild(actions);

    faqEditor.addEventListener('click', function (event) {
        const button = event.target.closest('.remove-faq');
        if (!button) return;
        const index = Number(button.dataset.index);
        faqs.splice(index, 1);
        setupAdminFaqEditor();
    });

    faqEditor.addEventListener('input', function (event) {
        const target = event.target;
        const index = Number(target.dataset.index);
        const field = target.dataset.field;
        if (typeof index !== 'number' || !field) return;
        faqs[index][field] = target.value;
    });

    // The add-faq button was removed per request; adding new FAQs is disabled.
    document.querySelector('#save-faqs').addEventListener('click', async function () {
        const saving = document.querySelector('#faq-saving');
        const status = document.querySelector('#faq-status');
        if (saving) saving.style.display = 'inline';

        await saveFaqs(faqs);

        if (saving) saving.style.display = 'none';
        if (status) {
            status.textContent = 'FAQ atualizada com sucesso!';
            status.classList.add('status-success');
            setTimeout(() => {
                status.textContent = '';
                status.classList.remove('status-success');
            }, 3000);
        }
        showToast('FAQ atualizada com sucesso');
    });

    function showToast(text) {
        let toast = document.querySelector('#faq-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'faq-toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('show');
        if (toast._timeout) clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }
}

async function setupGestaoPage() {
    const categoryForm = document.querySelector('#category-form');
    const categoryList = document.querySelector('#category-list');
    const postsByCategoryContainer = document.querySelector('#posts-by-category');

    if (!categoryForm || !categoryList || !postsByCategoryContainer) return;

    await syncCategories();
    await syncPosts();

    function renderCategories() {
        const categories = getCategories().length > 0 ? getCategories() : getDefaultCategories();
        categoryList.innerHTML = '';

        if (categories.length === 0) {
            categoryList.innerHTML = '<p>Nenhuma categoria cadastrada.</p>';
            return;
        }

        categories.forEach((category, index) => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <div class="category-title">${category.name}</div>
                <div class="category-actions">
                    <button type="button" class="btn btn-small btn-danger" data-action="delete" data-index="${index}">
                        Excluir
                    </button>
                </div>
            `;
            categoryList.appendChild(categoryItem);
        });
    }

    function renderPostsByCategory() {
        const categories = getCategories().length > 0 ? getCategories() : getDefaultCategories();
        const allPosts = getAllPosts().length > 0 ? getAllPosts() : DEFAULT_POSTS;

        postsByCategoryContainer.innerHTML = '';

        if (categories.length === 0) {
            postsByCategoryContainer.innerHTML = '<p>Nenhuma categoria cadastrada.</p>';
            return;
        }

        categories.forEach(category => {
            const categoryPosts = allPosts.filter(post =>
                post.category_id && parseInt(post.category_id) === category.id
            );

            const categorySection = document.createElement('div');
            categorySection.className = 'category-posts-section';
            categorySection.innerHTML = `
                <h3>${category.name} (${categoryPosts.length} publicação${categoryPosts.length !== 1 ? 's' : ''})</h3>
            `;

            if (categoryPosts.length === 0) {
                categorySection.innerHTML += '<p>Nenhuma publicação nesta categoria.</p>';
            } else {
                const postsList = document.createElement('div');
                postsList.className = 'posts-list';

                categoryPosts.forEach(post => {
                    const postItem = document.createElement('div');
                    postItem.className = 'post-item gestao-post-item';

                    // Format date
                    const date = new Date(post.createdAt);
                    const formattedDate = date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    postItem.innerHTML = `
                        <div class="post-content">
                            <h4>${post.title}</h4>
                            <p>${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                            <div class="post-meta">
                                <span>Por: ${getUserNameById(post.authorId)}</span>
                                <span>${formattedDate}</span>
                            </div>
                        </div>
                        <div class="post-actions">
                            <button type="button" class="btn btn-small btn-danger" data-action="delete-post" data-post-id="${post.id}">
                                Excluir Publicação
                            </button>
                        </div>
                    `;
                    postsList.appendChild(postItem);
                });

                categorySection.appendChild(postsList);
            }

            postsByCategoryContainer.appendChild(categorySection);
        });
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const name = categoryForm.querySelector('input[name="name"]').value.trim();
            const description = categoryForm.querySelector('textarea[name="description"]').value.trim();

            if (!name) {
                alert('Preencha o nome da categoria.');
                return;
            }

            // Description is optional now
            addCategory(name, description || '');
            categoryForm.reset();
            renderCategories();
            renderPostsByCategory();
        });
    }

    categoryList.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const index = button.dataset.index;
        if (index === undefined) return;

        if (button.dataset.action === 'delete') {
            if (!confirm('Tem certeza que deseja excluir esta categoria? Publicações nesta categoria serão afetadas.')) return;

            const categories = getCategories();
            const categoryToDelete = categories[index];

            if (!categoryToDelete) return;

            // Optional: Handle posts in this category (you might want to reassign them or delete them)
            // For now, we'll just delete the category and let posts reference a non-existent category
            // In a real app, you might want to handle this differently

            categories.splice(index, 1);
            saveCategories(categories);
            renderCategories();
            renderPostsByCategory();
            return;
        }
    });

    postsByCategoryContainer.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        if (button.dataset.action === 'delete-post') {
            const postId = button.dataset.postId;
            if (!postId) return;

            if (!confirm('Tem certeza que deseja excluir esta publicação?')) return;

            deletePost(postId);
            renderPostsByCategory();
            return;
        }
    });

    // Initial render
    renderCategories();
    renderPostsByCategory();
}

// Helper functions for gestao page
function addCategory(name, description) {
    const categories = getCategories();
    const newCategory = {
        id: Date.now(),
        name: name,
        description: description,
        createdBy: currentUser()?.id || 1, // Default to admin if no user
        createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    saveCategories(categories);
    return newCategory;
}

function getUserNameById(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === parseInt(userId));
    return user ? user.name : 'Usuário desconhecido';
}

function deletePost(postId) {
    const posts = getPosts();
    const postIndex = posts.findIndex(post => post.id === postId);

    if (postIndex !== -1) {
        posts.splice(postIndex, 1);
        savePosts(posts);

        // Also remove from user's posts
        const post = posts[postIndex]; // Get the post before it was removed (for author info)
        if (post) {
            const userPosts = getUserPostsFromStorage({ id: post.authorId }) || [];
            const userPostIndex = userPosts.findIndex(p => p.id === postId);
            if (userPostIndex !== -1) {
                userPosts.splice(userPostIndex, 1);
                saveUserPosts({ id: post.authorId }, userPosts);
            }
        }

        return true;
    }
    return false;
}

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