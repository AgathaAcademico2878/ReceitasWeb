// =====================================================
//  MENSAGENS DE CONTATO (localStorage)
// =====================================================

/** Retorna mensagens de contato salvas no localStorage */
function getMessages() {
    const raw = localStorage.getItem(STORAGE_KEYS.messages);
    return raw ? JSON.parse(raw) : [];
}

/** Salva lista de mensagens no localStorage */
function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
}

/** Adiciona uma nova mensagem ao início da lista */
function addMessage(message) {
    const messages = getMessages();
    messages.unshift(message);
    saveMessages(messages);
}