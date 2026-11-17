// =====================================================
//  GERENCIAMENTO DE USUÁRIOS (localStorage)
// =====================================================

/** Retorna o usuário atualmente logado do localStorage */
function getStoredUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

/** Salva dados do usuário no localStorage */
function setStoredUser(user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

/** Retorna a lista completa de usuários cadastrados */
function getAllUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (!raw) return [];
    try {
        const users = JSON.parse(raw);
        return Array.isArray(users) ? users : [];
    } catch { return []; }
}

/** Substitui a lista de usuários no localStorage */
function saveAllUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

/** Cadastra novo usuário no localStorage. Retorna false se já existir */
function registerNewUser(userData) {
    const allUsers = getAllUsers();
    const userExists = allUsers.some(u => u.name.toLowerCase() === userData.name.toLowerCase() || u.email.toLowerCase() === userData.email.toLowerCase());
    if (userExists) return false;
    allUsers.push(userData);
    saveAllUsers(allUsers);
    return true;
}

/** Busca usuário por nome no localStorage */
function findUserByName(name) {
    const allUsers = getAllUsers();
    return allUsers.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
}

/** Busca usuário por email no localStorage */
function findUserByEmail(email) {
    const allUsers = getAllUsers();
    return allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/** Define o usuário logado atual no localStorage */
function setCurrentUser(user) {
    // Map API 'photo' field to frontend 'avatar' field
    const userToStore = { ...user, avatar: user.photo || user.avatar };
    localStorage.setItem(STORAGE_KEYS.currentUserId, userToStore.email);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userToStore));
    // Also update in the users list so findUserByEmail returns updated avatar
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => (u.email || '').toLowerCase() === (userToStore.email || '').toLowerCase());
    if (userIndex !== -1) {
        allUsers[userIndex] = userToStore;
        saveAllUsers(allUsers);
    } else if (userToStore.email) {
        // User not in list yet, add them
        allUsers.push(userToStore);
        saveAllUsers(allUsers);
    }
}

/** Verifica se há um usuário logado */
function isUserLogged() {
    return localStorage.getItem(STORAGE_KEYS.logged) === 'true' && getStoredUser() !== null;
}

/** Retorna o objeto do usuário logado (ou null) */
function currentUser() {
    if (!isUserLogged()) return null;
    const currentUserId = localStorage.getItem(STORAGE_KEYS.currentUserId);

    // Always try to get from session first (has latest avatar from API)
    const sessionUser = getStoredUser();

    if (!currentUserId) return sessionUser;

    // Try to find in users list, but merge with session data to ensure avatar
    const listUser = findUserByEmail(currentUserId);
    if (listUser && sessionUser) {
        // Merge: use list data but ensure avatar from session (API response)
        return { ...listUser, avatar: sessionUser.avatar || listUser.avatar };
    }
    if (sessionUser) return sessionUser;
    if (listUser) return listUser;

    return null;
}

/** Verifica se o usuário logado é administrador */
function isAdmin() {
    return currentUser()?.isAdmin === true;
}

/** Desloga o usuário e redireciona para a tela de login */
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem(STORAGE_KEYS.logged);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    clearApiToken();
    window.location.href = resolvePath('public', 'login.html');
}

/** Atualiza dados do usuário no localStorage (lista + sessão) */
function updateUserInStorage(updatedUser) {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => (u.email || '').toLowerCase() === (updatedUser.email || '').toLowerCase());
    if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
        saveAllUsers(allUsers);
    }
    // Update current session if this is the logged user
    const currentUserId = localStorage.getItem(STORAGE_KEYS.currentUserId);
    if (currentUserId && currentUserId.toLowerCase() === (updatedUser.email || '').toLowerCase()) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    }
}

/** Atualiza nome e avatar do autor nas publicações existentes */
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
    if (changed) savePosts(posts);
}

/** Retorna o nome de um usuário pelo ID (usado na gestão) */
function getUserNameById(userId) {
    const users = getAllUsers();
    const user = users.find(u => u.id === parseInt(userId));
    return user ? user.name : 'Usuário desconhecido';
}