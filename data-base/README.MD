# 📁 data-base/

## Banco de Dados ReceitasWeb

O arquivo [data-base/dump.sql](data-base/dump.sql) contém o script completo de criação e população do banco de dados do projeto ReceitasWeb.

---

### 🎯 Objetivo do dump.sql

Este script é responsável por:

1. Criar o banco de dados `receitasweb`
2. Remover e recriar as tabelas principais
3. Inserir dados iniciais para testes e desenvolvimento
4. Definir as relações entre usuários, publicações, comentários, curtidas e FAQ

---

### 🗂️ Estrutura do banco

O banco é composto pelas seguintes tabelas:

- `users_types` — tipos de usuário, como `ADMIN` e `STANDARD`
- `users` — cadastro dos usuários da aplicação
- `categorias` — categorias das receitas
- `publicacoes` — receitas publicadas pelos usuários
- `curtidas` — curtidas atribuídas às publicações
- `comentarios` — comentários feitos nas receitas
- `receitas_salvas` — receitas marcadas como "quero fazer" ou "já fiz"
- `faqs_categories` — categorias das perguntas frequentes
- `faqs` — perguntas e respostas exibidas na área de FAQ

---

### 🧱 Conteúdo inicial incluído

O script já vem com dados de exemplo para facilitar o desenvolvimento, como:

- usuários cadastrados
- categorias de receitas
- publicações iniciais
- curtidas e comentários
- perguntas frequentes

---

### 🚀 Como importar o banco

#### Via phpMyAdmin

1. Acesse o phpMyAdmin
2. Crie um banco chamado `receitasweb`
3. Selecione o banco
4. Clique em "Importar"
5. Escolha o arquivo [data-base/dump.sql](data-base/dump.sql) e execute

#### Via terminal

```bash
mysql -u root -p < dump.sql
```

Se estiver dentro da pasta `data-base`, o comando pode ser executado assim:

```bash
mysql -u root -p < data-base/dump.sql
```

---

### ⚠️ Observações

- O script usa `utf8mb4` para suporte a caracteres especiais.
- As tabelas são recriadas ao importar o dump, então qualquer alteração anterior será substituída.
- É recomendável atualizar este arquivo sempre que a estrutura do banco for alterada.

---

### ✅ Resumo

O arquivo [data-base/dump.sql](data-base/dump.sql) é a base de dados completa do projeto, pronta para ser restaurada em qualquer ambiente de desenvolvimento.

