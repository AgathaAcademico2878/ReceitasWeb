// =====================================================
//  FORMULÁRIOS E PÁGINAS
//  Setup de login, cadastro, contato, feed, perfil,
//  FAQ pública, dashboard admin, admin FAQ, gestão
// =====================================================

// ---------- FORMULÁRIOS ----------

/** Configura o formulário de login (autenticação via API) */
function setupLoginForm() {
    const loginForm = document.querySelector('#login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('input[name="email"]').value.trim();
        const password = loginForm.querySelector('input[name="password"]').value.trim();

        const result = await apiFetch('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });

        if (result.code === 200 && result.data) {
            const user = {
                name: result.data.name,
                email: result.data.email,
                id: result.data.id,
                isAdmin: result.data.type_id === 1,
                typeId: result.data.type_id,
                photo: result.data.photo
            };

            setApiToken(result.data.token);
            setCurrentUser(user);
            localStorage.setItem(STORAGE_KEYS.logged, 'true');
            window.location.href = resolvePath('app', 'feed.html');
            return;
        }

        alert('Erro ao fazer login: ' + (result.message || 'Credenciais inválidas.'));
    });
}

/** Configura o formulário de cadastro (registro via API) */
function setupRegisterForm() {
    const registerForm = document.querySelector('#register-form');
    if (!registerForm) return;

    const adminToggle = registerForm.querySelector('#admin-toggle');
    const adminPasswordField = registerForm.querySelector('#admin-password-field');
    if (adminToggle && adminPasswordField) {
        adminToggle.addEventListener('change', function () {
            adminPasswordField.style.display = this.checked ? 'block' : 'none';
            if (!this.checked) {
                const adminPasswordInput = adminPasswordField.querySelector('input[name="admin_password"]');
                if (adminPasswordInput) adminPasswordInput.value = '';
            }
        });
    }

    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = registerForm.querySelector('input[name="name"]').value.trim();
        const email = registerForm.querySelector('input[name="email"]').value.trim();
        const password = registerForm.querySelector('input[name="password"]').value.trim();
        const avatarFile = registerForm.querySelector('input[name="avatar"]').files[0];
        const adminToggle = registerForm.querySelector('#admin-toggle');
        const adminPasswordInput = registerForm.querySelector('#admin-password');
        const wantsAdmin = adminToggle && adminToggle.checked;

        if (wantsAdmin && adminPasswordInput.value !== 'agatha') {
            alert('Senha de administrador incorreta!');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        if (avatarFile) {
            formData.append('photo', avatarFile);
        }

        const endpoint = wantsAdmin ? '/users/register-admin' : '/users/register';
        const result = await apiFetchFormData(endpoint, formData);

        if (result.code === 201 && result.data) {
            const loginResult = await apiFetch('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
            if (loginResult.code === 200 && loginResult.data) {
                setApiToken(loginResult.data.token);
                const user = {
                    name: loginResult.data.name,
                    email: loginResult.data.email,
                    id: loginResult.data.id,
                    isAdmin: loginResult.data.type_id === 1,
                    typeId: loginResult.data.type_id,
                    photo: loginResult.data.photo
                };
                setCurrentUser(user);
                localStorage.setItem(STORAGE_KEYS.logged, 'true');
                window.location.href = resolvePath('app', 'feed.html');
                return;
            }
        }

        alert('Erro ao cadastrar: ' + (result.message || 'Não foi possível conectar ao servidor.'));
    });
}

/** Configura o formulário de contato */
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

        addMessage({ name, email, message: messageText, sentAt: new Date().toISOString(), user: currentUser()?.name || 'Visitante' });
        alert('Mensagem enviada! Obrigado pelo contato.');
        contactForm.reset();
    });
}


// ---------- FEED ----------

/** Monta o card HTML de uma publicação */
function renderPostCard(post, currentUserEmail) {
    const liked = post.likes.includes(currentUserEmail);
    const likeText = liked ? 'Descurtir' : 'Curtir';
    const likeCount = post.likes.length;
    const commentsCount = post.comments.length;
    const postPhoto = post.photo ? `<img src="${getSiteBaseUrl()}/${post.photo}" alt="Foto da publicação" class="post-photo">` : '';

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
            ${postPhoto}
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

/** Configura a página de feed: sincroniza dados, renderiza publicações, gerencia curtidas e comentários */
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
        postsToDisplay.forEach(post => feedList.appendChild(renderPostCard(post, currentUserEmail)));
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
            const photoFile = publicationForm.querySelector('input[name="photo"]').files[0];

            if (!title || !content) { alert('Preencha título e descrição para publicar.'); return; }
            if (isNaN(categoryId) || categoryId <= 0) { alert('Selecione uma categoria para a publicação.'); return; }

            await createPost(title, content, categoryId, photoFile);
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


// ---------- FAQ PÚBLICA ----------

/** Carrega e renderiza as FAQs na página pública */
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


// ---------- PERFIL ----------

/** Monta o card de uma publicação na página de perfil */
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

/** Configura a página de perfil: informações do usuário, posts próprios e curtidos */
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

    myPostsSection.innerHTML = myPosts.length === 0
        ? '<p>Nenhuma publicação criada ainda.</p>'
        : '';
    myPosts.forEach(post => myPostsSection.appendChild(createProfilePostCard(post)));

    likedPostsSection.innerHTML = likedPosts.length === 0
        ? '<p>Você ainda não curtiu nenhuma publicação.</p>'
        : '';
    likedPosts.forEach(post => likedPostsSection.appendChild(createProfilePostCard(post)));
}

/** Configura o editor de perfil (botão editar, formulário, submissão) */
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
        avatarInput.value = '';
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

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const user = currentUser();
        if (!user) return;

        const name = nameInput.value.trim();
        const password = passwordInput.value.trim();
        const avatarFile = avatarInput.files[0];
        const bio = bioInput.value.trim();

        if (!name) { alert('O nome não pode ficar em branco.'); return; }

        user.name = name;
        if (password) user.password = password;
        user.bio = bio;

        // If avatar file selected, upload it
        if (avatarFile) {
            const formData = new FormData();
            formData.append('photo', avatarFile);

            try {
                const res = await apiFetchFormData('/users/photo', formData);
                if (res && res.status === 'success' && res.data && res.data.photo) {
                    user.avatar = res.data.photo; // Backend já retorna URL completa
                } else {
                    alert('Erro ao fazer upload da foto: ' + (res?.message || 'Erro desconhecido'));
                    return;
                }
            } catch (e) {
                alert('Erro ao fazer upload da foto');
                return;
            }
        }

        updateUserInStorage(user);
        updateAuthorInfoOnPosts(user);
        setupProfilePage();
        form.classList.add('hidden');
        alert('Perfil atualizado com sucesso!');
    });
}


// ---------- DASHBOARD ADMIN ----------

/** Exibe a mensagem de boas-vindas no dashboard administrativo */
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

/** Configura a lista de mensagens (pendentes e concluídas) no admin */
function setupAdminDashboard() {
    const messagesContainer = document.querySelector('#message-list');
    if (!messagesContainer) return;

    const messages = getMessages();
    if (!messages || messages.length === 0) {
        messagesContainer.innerHTML = '<p>Nenhuma mensagem recebida ainda.</p>';
        return;
    }

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

    messagesContainer.addEventListener('change', function (event) {
        const checkbox = event.target.closest('.msg-checkbox');
        if (!checkbox) return;
        const sentAt = checkbox.dataset.sentAt;
        const all = getMessages();
        const msg = all.find(m => m.sentAt === sentAt);
        if (!msg) return;
        msg.completed = checkbox.checked;
        saveMessages(all);
        setupAdminDashboard();
    });
}


// ---------- EDITOR DE FAQ (ADMIN) ----------

/** Configura o editor administrativo de FAQs (lista, criar, salvar, excluir) */
async function setupAdminFaqEditor() {
    const faqEditor = document.querySelector('#faq-editor');
    if (!faqEditor) return;

    const showToast = (text) => {
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
        toast._timeout = setTimeout(() => toast.classList.remove('show'), 3500);
    };

    let faqCollection = [];

    const renderFaqEditor = () => {
        faqEditor.innerHTML = '';
        faqEditor.classList.add('faq-editor-shell');

        const actions = document.createElement('div');
        actions.className = 'faq-actions';
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.id = 'add-faq';
        addButton.className = 'btn btn-primary';
        addButton.textContent = 'Adicionar FAQ';
        const status = document.createElement('p');
        status.id = 'faq-status';
        status.className = 'status-message';
        actions.appendChild(addButton);
        actions.appendChild(status);
        faqEditor.appendChild(actions);

        const modal = document.createElement('div');
        modal.className = 'faq-modal';
        modal.innerHTML = `
            <div class="faq-modal-card">
                <h2>Criar FAQ</h2>
                <form class="faq-create-form">
                    <label><span>Pergunta</span><input type="text" name="question" required></label>
                    <label><span>Resposta</span><textarea name="answer" required></textarea></label>
                    <div class="faq-create-actions">
                        <button type="submit" class="btn btn-primary">Criar</button>
                        <button type="button" class="btn cancel-faq-create">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        faqEditor.appendChild(modal);

        const form = modal.querySelector('form');
        const closeModal = () => { modal.classList.remove('open'); form.reset(); };

        addButton.onclick = () => { modal.classList.add('open'); form.querySelector('input[name="question"]').focus(); };
        modal.querySelector('.cancel-faq-create').onclick = closeModal;

        form.onsubmit = async (event) => {
            event.preventDefault();
            const question = String(form.querySelector('input[name="question"]').value || '').trim();
            const answer = String(form.querySelector('textarea[name="answer"]').value || '').trim();

            if (!question || !answer) {
                status.textContent = 'Preencha pergunta e resposta antes de criar.';
                status.classList.add('status-error');
                setTimeout(() => { status.textContent = ''; status.classList.remove('status-error'); }, 3000);
                return;
            }

            try {
                const result = await apiFetch('/faqs', { method: 'POST', body: JSON.stringify({ question, answer, faqs_category_id: 1 }) });
                if (result.code === 201 && result.data) {
                    faqCollection.unshift({ id: result.data.id, question: result.data.question || question, answer: result.data.answer || answer, faqs_category_id: result.data.faqs_category_id || 1 });
                } else if (result.code === 200 && result.data) {
                    faqCollection.unshift({ id: result.data.id, question: result.data.question || question, answer: result.data.answer || answer, faqs_category_id: result.data.faqs_category_id || 1 });
                } else {
                    faqCollection.unshift({ id: null, question, answer, faqs_category_id: 1 });
                }
                closeModal();
                renderFaqEditor();
                showToast('FAQ criada com sucesso');
            } catch (error) {
                console.error('Erro ao criar FAQ:', error);
                status.textContent = 'Não foi possível criar a FAQ.';
                status.classList.add('status-error');
                setTimeout(() => { status.textContent = ''; status.classList.remove('status-error'); }, 3000);
            }
        };

        const list = document.createElement('div');
        list.className = 'faq-editor-list';

        if (!faqCollection.length) {
            const emptyState = document.createElement('p');
            emptyState.className = 'faq-editor-empty';
            emptyState.textContent = 'Ainda não há FAQs cadastradas. Use o botão acima para criar a primeira.';
            list.appendChild(emptyState);
        }

        faqCollection.forEach((faq, index) => {
            const item = document.createElement('section');
            item.className = 'faq-item';

            const questionLabel = document.createElement('label');
            questionLabel.innerHTML = '<span>Pergunta</span>';
            const questionInput = document.createElement('input');
            questionInput.type = 'text';
            questionInput.value = String(faq.question || '');
            questionLabel.appendChild(questionInput);

            const answerLabel = document.createElement('label');
            answerLabel.innerHTML = '<span>Resposta</span>';
            const answerTextarea = document.createElement('textarea');
            answerTextarea.value = String(faq.answer || '');
            answerLabel.appendChild(answerTextarea);

            const actionsRow = document.createElement('div');
            actionsRow.className = 'faq-create-actions';

            const saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.className = 'btn btn-primary';
            saveButton.textContent = 'Salvar';

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn';
            removeButton.textContent = 'Excluir';

            saveButton.onclick = async () => {
                const nextQuestion = String(questionInput.value || '').trim();
                const nextAnswer = String(answerTextarea.value || '').trim();
                if (!nextQuestion || !nextAnswer) {
                    status.textContent = 'Pergunta e resposta não podem ficar vazias.';
                    status.classList.add('status-error');
                    setTimeout(() => { status.textContent = ''; status.classList.remove('status-error'); }, 3000);
                    return;
                }

                try {
                    const result = await apiFetch(`/faqs/${faq.id}`, { method: 'PUT', body: JSON.stringify({ question: nextQuestion, answer: nextAnswer, faqs_category_id: faq.faqs_category_id || 1 }) });
                    if (result.code === 200 || result.code === 201) {
                        faqCollection[index] = { ...faqCollection[index], question: nextQuestion, answer: nextAnswer, faqs_category_id: faq.faqs_category_id || 1 };
                        renderFaqEditor();
                        showToast('FAQ atualizada');
                    } else {
                        status.textContent = 'Não foi possível salvar a FAQ.';
                        status.classList.add('status-error');
                        setTimeout(() => { status.textContent = ''; status.classList.remove('status-error'); }, 3000);
                    }
                } catch (error) {
                    console.error('Erro ao atualizar FAQ:', error);
                    status.textContent = 'Não foi possível salvar a FAQ.';
                    status.classList.add('status-error');
                    setTimeout(() => { status.textContent = ''; status.classList.remove('status-error'); }, 3000);
                }
            };

            removeButton.onclick = async () => {
                if (!faq.id) {
                    faqCollection.splice(index, 1);
                    renderFaqEditor();
                    showToast('FAQ removida');
                    return;
                }
                try {
                    const result = await apiFetch(`/faqs/${faq.id}`, { method: 'DELETE' });
                    if (result.code === 200 || result.code === 204) {
                        faqCollection.splice(index, 1);
                        renderFaqEditor();
                        showToast('FAQ removida');
                    } else {
                        status.textContent = 'Não foi possível remover a FAQ.';
                        status.classList.add('status-error');
                        setTimeout(() => { status.textContent = ''; status.classList.remove('status-error'); }, 3000);
                    }
                } catch (error) {
                    console.error('Erro ao remover FAQ:', error);
                    status.textContent = 'Não foi possível remover a FAQ.';
                    status.classList.add('status-error');
                    setTimeout(() => { status.textContent = ''; status.classList.remove('status-error'); }, 3000);
                }
            };

            actionsRow.appendChild(saveButton);
            actionsRow.appendChild(removeButton);
            item.appendChild(questionLabel);
            item.appendChild(answerLabel);
            item.appendChild(actionsRow);
            list.appendChild(item);
        });

        faqEditor.appendChild(list);
    };

    faqEditor.innerHTML = '<p class="loading">Carregando FAQs...</p>';
    const faqs = await getFaqs();
    faqCollection = Array.isArray(faqs) ? faqs : [];
    renderFaqEditor();
}


// ---------- GESTÃO (ADMIN) ----------

/** Configura a página de gestão: CRUD de categorias e visualização de posts por categoria com filtro */
async function setupGestaoPage() {
    const categoryForm = document.querySelector('#category-form');
    const categoryList = document.querySelector('#category-list');
    const postsByCategoryContainer = document.querySelector('#posts-by-category');

    if (!categoryForm || !categoryList || !postsByCategoryContainer) return;

    await syncCategories();
    await syncPosts();

    // Estado do filtro
    let currentFilterCategoryId = null;

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
                    <button type="button" class="btn btn-small btn-danger" data-action="delete" data-index="${index}">Excluir</button>
                </div>
            `;
            categoryList.appendChild(categoryItem);
        });
        // Atualiza o select de filtro
        renderCategoryFilter(categories);
    }

    function renderCategoryFilter(categories) {
        // Remove filtro anterior se existir
        const existingFilter = document.querySelector('#category-filter');
        if (existingFilter) existingFilter.remove();

        const filterDiv = document.createElement('div');
        filterDiv.id = 'category-filter';
        filterDiv.className = 'category-filter';
        filterDiv.innerHTML = `
            <label for="filter-category">Filtrar por categoria:</label>
            <select id="filter-category" class="filter-select">
                <option value="">Todas as categorias</option>
                ${categories.map(cat => `<option value="${cat.id}" ${currentFilterCategoryId === cat.id ? 'selected' : ''}>${cat.name}</option>`).join('')}
            </select>
        `;
        // Insere antes do container de posts
        postsByCategoryContainer.parentNode.insertBefore(filterDiv, postsByCategoryContainer);

        // Event listener para o select
        const filterSelect = filterDiv.querySelector('#filter-category');
        filterSelect.addEventListener('change', function() {
            currentFilterCategoryId = this.value ? parseInt(this.value) : null;
            renderPostsByCategory();
        });
    }

    function renderPostsByCategory() {
        const categories = getCategories().length > 0 ? getCategories() : getDefaultCategories();
        const allPosts = getAllPosts().length > 0 ? getAllPosts() : DEFAULT_POSTS;

        postsByCategoryContainer.innerHTML = '';

        // Aplica filtro se selecionado
        let postsToShow = allPosts;
        if (currentFilterCategoryId) {
            postsToShow = allPosts.filter(post => post.category_id && parseInt(post.category_id) === currentFilterCategoryId);
        }

        if (categories.length === 0) {
            postsByCategoryContainer.innerHTML = '<p>Nenhuma categoria cadastrada.</p>';
            return;
        }

        // Se há filtro, mostra apenas a categoria filtrada
        const categoriesToShow = currentFilterCategoryId
            ? categories.filter(cat => cat.id === currentFilterCategoryId)
            : categories;

        categoriesToShow.forEach(category => {
            const categoryPosts = postsToShow.filter(post => post.category_id && parseInt(post.category_id) === category.id);
            const categorySection = document.createElement('div');
            categorySection.className = 'category-posts-section';
            categorySection.innerHTML = `<h3>${category.name} (${categoryPosts.length} publicação${categoryPosts.length !== 1 ? 's' : ''})</h3>`;

            if (categoryPosts.length === 0) {
                categorySection.innerHTML += '<p>Nenhuma publicação nesta categoria.</p>';
            } else {
                const postsList = document.createElement('div');
                postsList.className = 'posts-list';
                categoryPosts.forEach(post => {
                    const postItem = document.createElement('div');
                    postItem.className = 'post-item gestao-post-item';
                    const date = new Date(post.createdAt);
                    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
                            <button type="button" class="btn btn-small btn-danger" data-action="delete-post" data-post-id="${post.id}">Excluir Publicação</button>
                        </div>
                    `;
                    postsList.appendChild(postItem);
                });
                categorySection.appendChild(postsList);
            }
            postsByCategoryContainer.appendChild(categorySection);
        });
    }

    categoryForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const name = categoryForm.querySelector('input[name="name"]').value.trim();
        if (!name) { alert('Preencha o nome da categoria.'); return; }
        try {
            await addCategory(name, '');
            categoryForm.reset();
            await syncCategories(); // Garante que o localStorage está atualizado
            renderCategories();
            renderPostsByCategory();
            alert('Categoria criada com sucesso!');
        } catch (error) {
            alert('Erro ao criar categoria: ' + error.message);
        }
    });

    categoryList.addEventListener('click', async function (event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const index = button.dataset.index;
        if (index === undefined) return;

        if (button.dataset.action === 'delete') {
            if (!confirm('Tem certeza que deseja excluir esta categoria? Publicações nesta categoria serão afetadas.')) return;
            const categories = getCategories();
            const categoryToDelete = categories[index];
            if (!categoryToDelete) return;
            try {
                await deleteCategory(categoryToDelete.id);
                await syncCategories(); // Garante que o localStorage está atualizado
                renderCategories();
                renderPostsByCategory();
                alert('Categoria excluída com sucesso!');
            } catch (error) {
                alert('Erro ao excluir categoria: ' + error.message);
            }
        }
    });

    postsByCategoryContainer.addEventListener('click', async function (event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        if (button.dataset.action === 'delete-post') {
            const postId = button.dataset.postId;
            if (!postId) return;
            if (!confirm('Tem certeza que deseja excluir esta publicação?')) return;
            try {
                await deletePost(postId);
                await syncPosts(); // Garante que o localStorage está atualizado
                renderPostsByCategory();
                alert('Publicação excluída com sucesso!');
            } catch (error) {
                alert('Erro ao excluir publicação: ' + error.message);
            }
        }
    });

    renderCategories();
    renderPostsByCategory();
}