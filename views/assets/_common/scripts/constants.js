// =====================================================
//  CONSTANTES E UTILITÁRIOS
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

const DEFAULT_AVATAR = 'https://i.pinimg.com/474x/a7/d3/9e/a7d39eb1998731d8c45b9a72a376f884.jpg';

const DEFAULT_FAQS = [
    { id: 1, question: 'O que é o ReceitasWeb?', answer: 'É uma plataforma para compartilhar receitas culinárias.', faqs_category_id: 1 },
    { id: 2, question: 'Como posso criar uma conta?', answer: 'Acesse a página de cadastro e preencha seus dados.', faqs_category_id: 1 },
    { id: 3, question: 'Como publicar uma receita?', answer: 'Após fazer login, vá até o Feed e clique em "Nova Publicação".', faqs_category_id: 1 }
];

const DEFAULT_POSTS = [
    { id: '1', title: 'Bem-vindo ao ReceitasWeb!', content: 'Compartilhe suas receitas favoritas com a comunidade.', category_id: 1, author: { name: 'Equipe ReceitasWeb', email: 'admin@receitasweb.com', isAdmin: true }, authorId: 'admin@receitasweb.com', createdAt: new Date().toISOString(), likes: [], comments: [] }
];

/** Normaliza barras invertidas para barras comuns em caminhos */
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}

/** Identifica o tipo de página (admin, app, public) pela URL */
function getPageType() {
    const path = normalizePath(window.location.pathname);
    if (path.includes('/views/assets/admin/')) return 'admin';
    if (path.includes('/views/assets/app/')) return 'app';
    if (path.includes('/views/assets/public/')) return 'public';
    return 'public';
}

const PAGE_TYPE = getPageType();

/** Resolve caminhos relativos entre páginas de diferentes seções */
function resolvePath(target, page) {
    if (target === 'public') return PAGE_TYPE === 'public' ? page : `../public/${page}`;
    if (target === 'app') return PAGE_TYPE === 'app' ? page : `../app/${page}`;
    if (target === 'admin') return PAGE_TYPE === 'admin' ? page : `../admin/${page}`;
    return page;
}

/** Retorna o avatar ou um fallback padrão */
function getSafeAvatar(value) {
    const avatar = (value || '').toString().trim();
    return avatar ? avatar : DEFAULT_AVATAR;
}