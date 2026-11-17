# 📁 api/

## O Back-End — A API REST em PHP

---

### 🎯 Para que serve esta pasta?

A pasta `api/` contém todo o **código do servidor** (back-end). Aqui é onde o PHP processa as
requisições vindas do front-end e retorna respostas, geralmente em formato **JSON**.

Esta pasta funciona como uma **API REST** — ou seja, ela **não gera HTML**. Ela apenas recebe
requisições e devolve dados, sendo assim, aqui é necessário esquecer que existe `echo` ou `var_dump` — tudo deve ser retornado em JSON.

---

### 📦 O que é uma API REST?

**API** (Application Programming Interface) é uma interface que permite a comunicação entre sistemas.

**REST** (Representational State Transfer) é um padrão que utiliza os métodos HTTP:

| Método HTTP | Ação no banco de dados | Exemplo                    |
|-------------|------------------------|----------------------------|
| `GET`       | **Ler** dados          | Buscar lista de usuários   |
| `POST`      | **Criar** dados        | Cadastrar um novo usuário  |
| `PUT`       | **Atualizar** dados    | Editar dados de um usuário |
| `DELETE`    | **Excluir** dados      | Remover um usuário         |

> 💡 Esses 4 métodos formam o famoso **CRUD** (Create, Read, Update, Delete).

---

### 📂 Estrutura desta pasta

```
api/
├── .htaccess        ← Configuração do Apache para URLs amigáveis
├── composer.json    ← Arquivo de configuração do Composer (dependências)
├── index.php        ← Front Controller — ponto de entrada de TODAS as requisições
├── vendor/          ← Bibliotecas instaladas pelo Composer (NÃO editar!)
└── source/          ← Código-fonte da API
```

---

### 🔑 Arquivos importantes

#### `index.php` — Front Controller
Este é o **ponto de entrada** da API. Toda requisição que chega ao servidor passa por aqui primeiro.
Ele é responsável por:
- Carregar o autoload do Composer
- Iniciar o roteamento (Router)
- Direcionar a requisição para o Controller correto

#### `.htaccess` — Reescrita de URL
Este arquivo configura o Apache para redirecionar **todas** as requisições para o `index.php`.
Por exemplo, ao acessar `api/usuarios`, o Apache reescreve internamente para `api/index.php?route=/usuarios`.

```apache
RewriteEngine On
RewriteCond %{SCRIPT_FILENAME} !-f
RewriteCond %{SCRIPT_FILENAME} !-d
RewriteRule ^(.*)$ index.php?route=/$1 [L,QSA]
```

#### `composer.json` — Gerenciador de Dependências
O Composer é o gerenciador de pacotes do PHP (similar ao `npm` do JavaScript).
Aqui definimos as dependências do projeto e o **autoload** das classes.

---

### 🔗 Relação com o MVC

```
index.php (Front Controller)
    ↓
Router (Core/Router.php) → identifica a rota
    ↓
Controller (Controller/Api.php) → processa a lógica
    ↓
Model (Models/User.php) → acessa o banco de dados
    ↓
Resposta JSON → enviada ao front-end
```

---

### 🧭 Rotas CRUD disponíveis em `api/index.php`

A API define vários recursos com operações básicas de CRUD. A seguir está a lista de rotas atualmente disponíveis.

#### Usuários
- `GET /api/users/list` — lista todos os usuários
- `GET /api/users/list/{user_id}` — obtém um usuário por ID
- `POST /api/users/register` — registra um novo usuário
- `POST /api/users/login` — autentica um usuário padrão
- `POST /api/users/login-admin` — autentica um usuário administrador
- `POST /api/users/update` — atualiza dados do usuário

#### Categorias
- `GET /api/categorias/list` — lista todas as categorias
- `GET /api/categorias/list/{category_id}` — obtém uma categoria por ID
- `POST /api/categorias` — cria uma nova categoria
- `PUT /api/categorias/{category_id}` — atualiza uma categoria
- `DELETE /api/categorias/{category_id}` — exclui uma categoria

#### Publicações
- `GET /api/publicacoes/list` — lista todas as publicações
- `GET /api/publicacoes/list/paginator/{page}/{per_page}` — lista publicações paginadas
- `GET /api/publicacoes/list/{publicacao_id}` — obtém uma publicação por ID
- `POST /api/publicacoes` — cria uma nova publicação
- `PUT /api/publicacoes/{publicacao_id}` — atualiza uma publicação
- `DELETE /api/publicacoes/{publicacao_id}` — exclui uma publicação

#### Minhas Publicações
- `GET /api/minhas-publicacoes/list/paginator/{user_id}/{page}/{per_page}` — lista publicações de um usuário, paginadas
- `GET /api/minhas-publicacoes/list/{user_id}` — lista publicações de um usuário

#### Curtidas
- `GET /api/curtidas/list` — lista todas as curtidas
- `GET /api/curtidas/list/paginator/{page}/{per_page}` — lista curtidas paginadas
- `GET /api/curtidas/list/{curtida_id}` — obtém uma curtida por ID
- `GET /api/curtidas/user/{user_id}` — lista curtidas de um usuário
- `GET /api/curtidas/publicacao/{publicacao_id}` — lista curtidas de uma publicação
- `POST /api/curtidas` — cria uma nova curtida
- `DELETE /api/curtidas/{curtida_id}` — remove uma curtida

#### Comentários
- `GET /api/comentarios/list` — lista todos os comentários
- `GET /api/comentarios/list/paginator/{page}/{per_page}` — lista comentários paginados
- `GET /api/comentarios/list/{comentario_id}` — obtém um comentário por ID
- `GET /api/comentarios/user/{user_id}` — lista comentários de um usuário
- `GET /api/comentarios/publicacao/{publicacao_id}` — lista comentários de uma publicação
- `POST /api/comentarios` — cria um novo comentário
- `DELETE /api/comentarios/{comentario_id}` — remove um comentário

#### Receitas Salvas
- `GET /api/receitas-salvas/list` — lista todas as receitas salvas
- `GET /api/receitas-salvas/list/paginator/{page}/{per_page}` — lista receitas salvas paginadas
- `GET /api/receitas-salvas/list/{receita_salva_id}` — obtém uma receita salva por ID
- `GET /api/receitas-salvas/user/{user_id}/{tipo}` — lista receitas salvas de um usuário por tipo (`quero_fazer` ou `ja_fiz`)
- `GET /api/receitas-salvas/user/{user_id}` — lista receitas salvas de um usuário
- `POST /api/receitas-salvas` — cria uma receita salva
- `PUT /api/receitas-salvas/{receita_salva_id}` — atualiza uma receita salva
- `DELETE /api/receitas-salvas/{receita_salva_id}` — exclui uma receita salva

#### FAQs Categories
- `GET /api/faqs-categories/list` — lista todas as categorias de FAQ
- `GET /api/faqs-categories/list/{category_id}` — obtém uma categoria de FAQ por ID
- `POST /api/faqs-categories` — cria uma nova categoria de FAQ
- `PUT /api/faqs-categories/{category_id}` — atualiza uma categoria de FAQ
- `DELETE /api/faqs-categories/{category_id}` — exclui uma categoria de FAQ

#### FAQs
- `GET /api/faqs/list` — lista todas as FAQs
- `GET /api/faqs/list/{faq_id}` — obtém uma FAQ por ID
- `GET /api/faqs/category/{category_id}` — lista FAQs por categoria
- `POST /api/faqs` — cria uma nova FAQ
- `PUT /api/faqs/{faq_id}` — atualiza uma FAQ
- `DELETE /api/faqs/{faq_id}` — exclui uma FAQ

---

> 📚 Essa documentação reflete as rotas atuais definidas em `api/index.php`. Se alguma rota for alterada no arquivo, atualize também este README.

