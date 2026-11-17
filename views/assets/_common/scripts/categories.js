// =====================================================
//  CATEGORIAS
// =====================================================

/** Busca o nome de uma categoria pelo ID */
function getCategoryNameById(categoryId) {
    const categories = getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
}

/** Sincroniza categorias da API para o localStorage */
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

/** Retorna categorias salvas no localStorage */
function getCategories() {
    const raw = localStorage.getItem(STORAGE_KEYS.categories);
    if (!raw) return [];
    try {
        const categories = JSON.parse(raw);
        return Array.isArray(categories) ? categories : [];
    } catch { return []; }
}

/** Salva lista de categorias no localStorage */
function saveCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}

/** Retorna categorias padrão (fallback) */
function getDefaultCategories() {
    return [
        { id: 1, name: 'Sopas', description: 'Sopas e cremes quentes para dias frios', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 2, name: 'Sobremesas', description: 'Doces e sobremesas para finalizar a refeição', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 3, name: 'Massas', description: 'Pratos de massa italiana e outras variações', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 4, name: 'Saladas', description: 'Saladas frescas e saudáveis para qualquer refeição', createdBy: 1, createdAt: new Date().toISOString() },
        { id: 5, name: 'Bebidas', description: 'Sucos, chás, smoothies e outras bebidas', createdBy: 1, createdAt: new Date().toISOString() }
    ];
}

/** Adiciona uma nova categoria via API */
async function addCategory(name, description) {
    const formData = new FormData();
    formData.append('name', name);
    // description não existe na tabela categorias, mas podemos ignorar ou adicionar depois

    try {
        const result = await apiFetchFormData('/categorias', formData);
        if (result && result.status === 'success' && result.data) {
            await syncCategories(); // Atualiza localStorage com dados do servidor
            return result.data;
        }
        throw new Error(result?.message || 'Erro ao criar categoria');
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
    }
}

/** Exclui uma categoria via API */
async function deleteCategory(categoryId) {
    try {
        const result = await apiFetch(`/categorias/${categoryId}`, { method: 'DELETE' });
        if (result && result.status === 'success') {
            await syncCategories(); // Atualiza localStorage com dados do servidor
            return true;
        }
        throw new Error(result?.message || 'Erro ao excluir categoria');
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        throw error;
    }
}