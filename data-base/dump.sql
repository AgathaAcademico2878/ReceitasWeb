-- =====================================================
-- Database: receitasweb
-- =====================================================

CREATE DATABASE IF NOT EXISTS receitasweb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE receitasweb;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS receitas_salvas;
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS curtidas;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS faqs_categories;
DROP TABLE IF EXISTS publicacoes;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS users_types;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- Tabela users_types
-- -----------------------------------------------------

CREATE TABLE users_types (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users_types (id, name, active) VALUES
(1, 'ADMIN', 1),
(2, 'STANDARD', 1);

-- -----------------------------------------------------
-- Tabela users
-- -----------------------------------------------------

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    type_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,

    PRIMARY KEY (id),

    CONSTRAINT fk_users_users_types
        FOREIGN KEY (type_id)
        REFERENCES users_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (id, type_id, name, email, password, photo, active) VALUES
(1, 1, 'Admin', 'admin@admin.com',
'$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',
NULL, 1),

(2, 2, 'Maria Santos', 'maria@email.com',
'$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',
NULL, 1),

(3, 2, 'João Pedro', 'joao@email.com',
'$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',
NULL, 1),

(4, 2, 'Laura Ribeiro', 'laura@email.com',
'$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',
NULL, 1);

-- -----------------------------------------------------
-- Tabela categorias
-- -----------------------------------------------------

CREATE TABLE categorias (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categorias (id, name, active) VALUES
(1, 'Sopas', 1),
(2, 'Sobremesas', 1),
(3, 'Massas', 1),
(4, 'Saladas', 1),
(5, 'Carnes', 1);

-- -----------------------------------------------------
-- Tabela publicacoes
-- -----------------------------------------------------

CREATE TABLE publicacoes (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments LONGTEXT NULL,
    likes LONGTEXT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,

    PRIMARY KEY (id),

    CONSTRAINT fk_publicacoes_users
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_publicacoes_categorias
        FOREIGN KEY (category_id)
        REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO publicacoes
(id, user_id, category_id, title, description, created_at, comments, likes, active)
VALUES

(1, 2, 1,
'Sopa de Legumes',
'Uma sopa nutritiva com legumes frescos da estação.',
'2026-06-15 10:00:00',
NULL,
NULL,
1),

(2, 3, 2,
'Pudim de Leite',
'Pudim clássico com calda de caramelo.',
'2026-06-15 11:00:00',
NULL,
NULL,
1),

(3, 4, 3,
'Macarrão à Carbonara',
'Massas com molho cremoso de ovos e bacon.',
'2026-06-15 12:00:00',
NULL,
NULL,
1);

-- -----------------------------------------------------
-- Tabela curtidas
-- -----------------------------------------------------

CREATE TABLE curtidas (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    publicacao_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_curtidas_users
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_curtidas_publicacoes
        FOREIGN KEY (publicacao_id)
        REFERENCES publicacoes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO curtidas (id, user_id, publicacao_id, created_at) VALUES
(1, 2, 1, '2026-06-15 14:00:00'),
(2, 3, 1, '2026-06-16 10:30:00'),
(3, 4, 2, '2026-06-17 08:15:00');

-- -----------------------------------------------------
-- Tabela comentarios
-- -----------------------------------------------------

CREATE TABLE comentarios (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    publicacao_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_comentarios_users
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_comentarios_publicacoes
        FOREIGN KEY (publicacao_id)
        REFERENCES publicacoes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO comentarios (id, user_id, publicacao_id, comment, created_at) VALUES
(1, 3, 1, 'Adorei essa sopa! Muito nutritiva.', '2026-06-15 14:30:00'),
(2, 4, 1, 'Vou testar amanhã no almoço.', '2026-06-15 15:00:00'),
(3, 2, 3, 'O segredo é usar bacon de qualidade.', '2026-06-16 09:00:00');

-- -----------------------------------------------------
-- Tabela receitas_salvas
-- -----------------------------------------------------

CREATE TABLE receitas_salvas (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    publicacao_id INT NOT NULL,
    tipo ENUM('quero_fazer', 'ja_fiz') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_receitas_salvas_users
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_receitas_salvas_publicacoes
        FOREIGN KEY (publicacao_id)
        REFERENCES publicacoes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO receitas_salvas (id, user_id, publicacao_id, tipo, created_at) VALUES
(1, 2, 1, 'quero_fazer', '2026-06-15 14:00:00'),
(2, 3, 2, 'ja_fiz', '2026-06-16 10:30:00'),
(3, 4, 3, 'quero_fazer', '2026-06-17 08:15:00');

-- -----------------------------------------------------
-- Tabela faqs_categories
-- -----------------------------------------------------

CREATE TABLE faqs_categories (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO faqs_categories (id, name, active) VALUES
(1, 'Sobre o Site', 1),
(2, 'Publicações', 1),
(3, 'Conta e Cadastro', 1);

-- -----------------------------------------------------
-- Tabela faqs
-- -----------------------------------------------------

CREATE TABLE faqs (
    id INT NOT NULL AUTO_INCREMENT,
    faqs_category_id INT NOT NULL,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,

    PRIMARY KEY (id),

    CONSTRAINT fk_faqs_faqs_categories
        FOREIGN KEY (faqs_category_id)
        REFERENCES faqs_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO faqs (id, faqs_category_id, question, answer, active) VALUES
(1, 1,
'O que é o ReceitasWeb?',
'É uma plataforma para compartilhar receitas culinárias, onde usuários podem publicar, curtir e comentar receitas.',
1),

(2, 1,
'Como posso encontrar receitas?',
'Você pode navegar pelas categorias ou usar a página de feed para ver todas as publicações mais recentes.',
1),

(3, 1,
'O site é gratuito?',
'Sim, o ReceitasWeb é totalmente gratuito. Basta criar uma conta para começar a publicar e interagir.',
1),

(4, 2,
'Como publicar uma receita?',
'Faça login, vá até o feed e clique em "Nova Publicação". Preencha o título, a descrição e selecione uma categoria.',
1),

(5, 2,
'Posso editar ou excluir minha publicação?',
'Sim, você pode editar ou excluir suas próprias publicações a qualquer momento através da página de perfil.',
1),

(6, 2,
'Como funciona o sistema de curtidas?',
'Você pode curtir publicações de outros usuários clicando no ícone de coração. Sua curtida será registrada imediatamente.',
1),

(7, 3,
'Como criar uma conta?',
'Vá até a página de cadastro, preencha seu nome, e-mail e senha. Pronto! Sua conta será criada na hora.',
1),

(8, 3,
'Esqueci minha senha. O que fazer?',
'Entre em contato conosco através da página de contato para redefinir sua senha.',
1),

(9, 3,
'Como atualizar meus dados?',
'Faça login e acesse seu perfil. Lá você pode editar seu nome, e-mail e foto.',
1);