// =====================================================
//  PUBLICAÇÕES (POSTS)
// =====================================================

/** Busca dados de um usuário pelo ID via API */
async function getUserById(userId) {
    try {
        const res = await apiFetch(`/users/list/${userId}`);
        if (res && res.data) return res.data;
    } catch {}
    return null;
}

/** Converte uma publicação da API para o formato interno do frontend */
function transformApiPost(apiPost) {
    let comments = [];
    if (apiPost.comments) {
        try {
            const parsed = typeof apiPost.comments === 'string' ? JSON.parse(apiPost.comments) : apiPost.comments;
            comments = Array.isArray(parsed) ? parsed : [];
        } catch { comments = []; }
    }
    let likes = [];
    if (apiPost.likes) {
        try {
            const parsed = typeof apiPost.likes === 'string' ? JSON.parse(apiPost.likes) : apiPost.likes;
            likes = Array.isArray(parsed) ? parsed : [];
        } catch { likes = []; }
    }

    // Use author_photo from API (joined from users table), fallback to localStorage
    let authorAvatar = '';
    if (apiPost.author_photo) {
        authorAvatar = apiPost.author_photo;
    } else if (apiPost.author_email) {
        try {
            const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const author = allUsers.find(u => u.email?.toLowerCase() === apiPost.author_email.toLowerCase());
            if (author) authorAvatar = author.avatar || '';
        } catch {}
    }

    return {
        id: String(apiPost.id),
        title: apiPost.title || '',
        content: apiPost.description || '',
        category_id: apiPost.category_id || null,
        photo: apiPost.photo || null,
        author: {
            name: apiPost.author_name || 'Usuário',
            email: apiPost.author_email || '',
            avatar: authorAvatar,
            isAdmin: false
        },
        authorId: apiPost.user_id ? String(apiPost.user_id) : '',
        createdAt: apiPost.created_at || new Date().toISOString(),
        likes: likes,
        comments: comments.map(function (c) {
            return { user: c.user || c.name || 'Usuário', message: c.message || c.text || '', sentAt: c.sentAt || c.sent_at || new Date().toISOString() };
        })
    };
}

/** Sincroniza publicações da API para o localStorage */
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

/** Retorna publicações salvas no localStorage */
function getPosts() {
    const raw = localStorage.getItem(STORAGE_KEYS.posts);
    if (!raw) return [];
    try {
        const posts = JSON.parse(raw);
        return Array.isArray(posts) ? posts : [];
    } catch { return []; }
}

function getAllPosts() { return getPosts(); }

/** Salva lista de publicações no localStorage */
function savePosts(posts) {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
}

/** Gera a chave usada para salvar publicações de um usuário específico */
function getUserPostsKey(user) {
    if (!user) return null;
    const id = (user.email || user.name || '').toString().trim().toLowerCase();
    return id ? `receitasWebPosts_${id}` : null;
}

/** Retorna publicações de um usuário específico do localStorage */
function getUserPostsFromStorage(user) {
    const key = getUserPostsKey(user);
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        const posts = JSON.parse(raw);
        return Array.isArray(posts) ? posts : null;
    } catch { return null; }
}

/** Salva publicações de um usuário específico no localStorage */
function saveUserPosts(user, posts) {
    const key = getUserPostsKey(user);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(posts));
}

/** Filtra publicações pelo autor (usuário logado) */
function getUserPosts(user) {
    const allPosts = getPosts();
    if (!user) return [];
    return allPosts.filter(function (post) {
        if (!post || !post.author) return false;
        const authorEmail = (post.author.email || '').toString().trim().toLowerCase();
        return authorEmail === (user.email || '').toString().trim().toLowerCase();
    });
}

/** Cria uma nova publicação via API e salva localmente */
async function createPost(title, content, categoryId = null, photoFile = null) {
    const user = currentUser();
    if (!user) return null;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', content);
    formData.append('category_id', categoryId || 1);
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    try {
        const res = await apiFetchFormData('/publicacoes', formData);
        if (res && res.status === 'success') await syncPosts();
    } catch {}

    const posts = getPosts();
    const post = {
        id: Date.now().toString(),
        title,
        content,
        category_id: categoryId || 1,
        photo: null,
        author: { name: user.name, email: user.email, avatar: user.avatar, isAdmin: user.isAdmin || false },
        authorId: user.email,
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

/** Alterna o like de uma publicação (curtir/descurtir) */
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

/** Adiciona um comentário a uma publicação */
async function addCommentToPost(postId, commentText) {
    const user = currentUser();
    if (!user) return null;

    const posts = getPosts();
    const post = posts.find(item => item.id === postId);
    if (!post) return null;

    post.comments.unshift({ user: user.name, message: commentText, sentAt: new Date().toISOString() });
    savePosts(posts);

    try {
        await apiFetch('/publicacoes/' + postId, { method: 'PUT', body: JSON.stringify({ comments: post.comments }) });
    } catch {}

    return post;
}

/** Atualiza uma publicação via API (inclui upload de foto opcional) */
async function updatePost(postId, title, content, categoryId, photoFile = null) {
    const user = currentUser();
    if (!user) return false;

    const formData = new FormData();
    formData.append('publicacao_id', postId);
    formData.append('title', title);
    formData.append('description', content);
    formData.append('category_id', categoryId || 1);
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    try {
        const res = await apiFetchFormData('/publicacoes/' + postId, formData);
        if (res && res.status === 'success') {
            await syncPosts();
            return true;
        }
    } catch {}
    return false;
}

/** Upload apenas da foto de uma publicação */
async function uploadPostPhoto(postId, photoFile) {
    const user = currentUser();
    if (!user) return null;

    const formData = new FormData();
    formData.append('publicacao_id', postId);
    formData.append('photo', photoFile);

    try {
        const res = await apiFetchFormData('/publicacoes/' + postId + '/photo', formData);
        if (res && res.status === 'success' && res.data && res.data.photo) {
            await syncPosts();
            return res.data.photo;
        }
    } catch {}
    return null;
}

/** Exclui uma publicação pelo ID via API */
async function deletePost(postId) {
    try {
        const result = await apiFetch(`/publicacoes/${postId}`, { method: 'DELETE' });
        if (result && result.status === 'success') {
            // Remove do localStorage
            const posts = getPosts();
            const postIndex = posts.findIndex(post => post.id === postId);

            if (postIndex !== -1) {
                const post = posts[postIndex];
                posts.splice(postIndex, 1);
                savePosts(posts);

                // Remove também das publicações do autor
                if (post) {
                    const userPosts = getUserPostsFromStorage({ id: post.authorId }) || [];
                    const userPostIndex = userPosts.findIndex(p => p.id === postId);
                    if (userPostIndex !== -1) {
                        userPosts.splice(userPostIndex, 1);
                        saveUserPosts({ id: post.authorId }, userPosts);
                    }
                }
            }
            await syncPosts(); // Atualiza do servidor
            return true;
        }
        throw new Error(result?.message || 'Erro ao excluir publicação');
    } catch (error) {
        console.error('Erro ao excluir publicação:', error);
        throw error;
    }
}