--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

--

-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin','admin@admin.com','$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',1),
(2,'Maria Santos','maria@email.com','$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',0),
(3,'João Pedro','joao@email.com','$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',0),
(4,'Laura Ribeiro','laura@email.com','$2y$10$e0MI1RB8d.o0rPqy1FoMdelFfFFmqYf6iIH4.v2AMZUeW.B5KygMS',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_categorias_users_idx` (`created_by`),
  CONSTRAINT `fk_categorias_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES
(1,'Sopas','Sopas e cremes quentes para dias frios',1,'2026-06-15 08:00:00'),
(2,'Sobremesas','Doces e sobremesas para finalizar a refeição',1,'2026-06-15 08:00:00'),
(3,'Massas','Pratos de massa italiana e outras variações',1,'2026-06-15 08:00:00'),
(4,'Saladas','Saladas frescas e saudáveis para qualquer refeição',1,'2026-06-15 08:00:00'),
(5,'Bebidas','Sucos, chás, smoothies e outras bebidas',1,'2026-06-15 08:00:00');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacoes`
--

DROP TABLE IF EXISTS `publicacoes`;
CREATE TABLE `publicacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) NOT NULL,
  `description` text,
  `comments` json NULL,
  `likes` json NULL,
  PRIMARY KEY (`id`),
  KEY `fk_publicacoes_users_idx` (`user_id`),
  KEY `fk_publicacoes_categorias_idx` (`category_id`),
  CONSTRAINT `fk_publicacoes_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_publicacoes_categorias` FOREIGN KEY (`category_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `publicacoes`
--

LOCK TABLES `publicacoes` WRITE;
/*!40000 ALTER TABLE `publicacoes` DISABLE KEYS */;
INSERT INTO `publicacoes` VALUES
(1,2,1,'2026-06-15 10:00:00','Minha sopa cremosa de abóbora','Compartilho a receita da sopa que aquece qualquer noite fria. Muito fácil e perfeita para a família.','[]','[]'),
(2,3,5,'2026-06-14 15:00:00','Arroz caramelizado com castanhas','Receita ideal para quem ama o sabor adocicado e crocante. Fica lindo na mesa e rende muito bem.','[]','[]'),
(3,4,2,'2026-06-12 09:00:00','Creme de café com caramelo','Uma sobremesa suave, com textura aveludada e aroma intenso. Perfeita para finalizar um jantar especial.','[]','[]');
/*!40000 ALTER TABLE `publicacoes` ENABLE KEYS */;
UNLOCK TABLES;