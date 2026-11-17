// =====================================================
//  FAQ (Perguntas Frequentes)
// =====================================================

let _faqsCache = null;

/** Retorna FAQs — tenta API primeiro, depois localStorage, depois fallback */
async function getFaqs() {
    try {
        const result = await apiFetch('/faqs/list');
        if (result.code === 200 && Array.isArray(result.data)) {
            _faqsCache = result.data.map(item => ({ id: item.id, question: item.question, answer: item.answer, faqs_category_id: item.faqs_category_id }));
            return _faqsCache;
        }
    } catch (e) {}

    if (_faqsCache) return _faqsCache;
    const raw = localStorage.getItem(STORAGE_KEYS.faqs);
    if (!raw) return DEFAULT_FAQS.slice();
    try {
        const value = JSON.parse(raw);
        const faqs = Array.isArray(value) ? value : DEFAULT_FAQS.slice();
        _faqsCache = faqs;
        return faqs;
    } catch { return DEFAULT_FAQS.slice(); }
}

/** Salva FAQs no localStorage e sincroniza com a API */
async function saveFaqs(faqs) {
    const normalizedFaqs = faqs.map((faq) => ({
        ...faq,
        question: String(faq.question || '').trim(),
        answer: String(faq.answer || '').trim(),
        faqs_category_id: Number(faq.faqs_category_id) || 1
    }));

    localStorage.setItem(STORAGE_KEYS.faqs, JSON.stringify(normalizedFaqs));
    _faqsCache = normalizedFaqs;

    const token = getApiToken();
    if (!token) return;

    // Sincroniza com a API: cria, atualiza ou remove conforme necessário
    try {
        const current = await apiFetch('/faqs/list');
        const existingIds = (current.code === 200 && Array.isArray(current.data))
            ? current.data.map(f => f.id).filter(id => id != null)
            : [];

        const syncedFaqs = [];
        for (const faq of normalizedFaqs) {
            const payload = { question: faq.question, answer: faq.answer, faqs_category_id: faq.faqs_category_id || 1 };

            if (faq.id && existingIds.includes(faq.id)) {
                const result = await apiFetch(`/faqs/${faq.id}`, { method: 'PUT', body: JSON.stringify(payload) });
                syncedFaqs.push(result.code === 200 && result.data ? { ...faq, ...result.data } : { ...faq });
            } else {
                const result = await apiFetch('/faqs', { method: 'POST', body: JSON.stringify(payload) });
                syncedFaqs.push(result.code === 201 && result.data ? { ...faq, id: result.data.id, question: result.data.question || faq.question, answer: result.data.answer || faq.answer, faqs_category_id: result.data.faqs_category_id || faq.faqs_category_id || 1 } : { ...faq });
            }
        }

        const currentIds = syncedFaqs.map(f => f.id).filter(id => id != null);
        for (const existingId of existingIds) {
            if (!currentIds.includes(existingId)) await apiFetch(`/faqs/${existingId}`, { method: 'DELETE' });
        }

        localStorage.setItem(STORAGE_KEYS.faqs, JSON.stringify(syncedFaqs));
        _faqsCache = syncedFaqs;
    } catch (e) {
        console.warn('Erro ao sincronizar FAQs com a API:', e);
    }
}