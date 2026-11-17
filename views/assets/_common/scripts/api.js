// =====================================================
//  CONFIGURAÇÃO DA API
// =====================================================

const API_BASE_URL = window.location.origin + '/ReceitasWeb/api';

/** Retorna a base URL da API */
function getApiBaseUrl() {
    return window.location.origin + '/ReceitasWeb/api';
}

/** Retorna a base URL do site (para assets, uploads, etc.) */
function getSiteBaseUrl() {
    return window.location.origin + '/ReceitasWeb';
}

/** Retorna o token JWT salvo no localStorage */
function getApiToken() {
    return localStorage.getItem('receitasWebApiToken');
}

/** Salva o token JWT no localStorage */
function setApiToken(token) {
    localStorage.setItem('receitasWebApiToken', token);
}

/** Remove o token JWT do localStorage */
function clearApiToken() {
    localStorage.removeItem('receitasWebApiToken');
}

/** Faz uma requisição fetch para a API com headers padrão (JSON + token) */
async function apiFetch(endpoint, options = {}) {
    const url = API_BASE_URL + endpoint;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = getApiToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
        headers['token'] = token;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        const text = await response.text();
        if (!text) {
            return { code: response.status, status: response.ok ? 'success' : 'error', message: response.ok ? 'Sucesso sem conteúdo' : 'Resposta vazia do servidor.' };
        }
        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('API JSON parse error:', parseError, 'response text:', text);
            return { code: 500, status: 'error', message: 'Resposta inválida do servidor.', raw: text };
        }
    } catch (error) {
        console.error('API Error:', error);
        return { code: 500, status: 'error', message: 'Erro de conexão com o servidor.' };
    }
}

/** Faz uma requisição fetch para upload de arquivos (multipart/form-data) */
async function apiFetchFormData(endpoint, formData) {
    const url = API_BASE_URL + endpoint;
    const headers = {};

    const token = getApiToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
        headers['token'] = token;
    }
    // NÃO definir Content-Type - o browser define automaticamente com boundary

    try {
        const response = await fetch(url, { method: 'POST', body: formData, headers });
        const text = await response.text();
        if (!text) {
            return { code: response.status, status: response.ok ? 'success' : 'error', message: response.ok ? 'Sucesso sem conteúdo' : 'Resposta vazia do servidor.' };
        }
        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('API JSON parse error:', parseError, 'response text:', text);
            return { code: 500, status: 'error', message: 'Resposta inválida do servidor.', raw: text };
        }
    } catch (error) {
        console.error('API Error:', error);
        return { code: 500, status: 'error', message: 'Erro de conexão com o servidor.' };
    }
}