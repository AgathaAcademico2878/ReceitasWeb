<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
// timezone para São Paulo América
date_default_timezone_set('America/Sao_Paulo');

ob_start();

// Salva o body bruto antes do router consumir php://input
$_SERVER['RAW_HTTP_BODY'] = file_get_contents('php://input');

require  __DIR__ . "/vendor/autoload.php";

// os headers abaixo são necessários para permitir o acesso a API por clientes externos ao domínio
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true'); // Permitir credenciais

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;

$route = new Router(url("api"), ":");

$route->namespace("Source\Controller");


$route->get("/hello", "Api:hello");

// ===== Users =====
$route->get("/users/list", "Users:listAll");
$route->get("/users/list/{user_id}", "Users:listById");
$route->post("/users/register", "Users:register");
$route->post("/users/login", "Users:auth");
$route->post("/users/login-admin", "Users:authAdmin");
$route->post("/users/update", "Users:update");
$route->get("/users/list/{user_id}", "Users:listById");

// ===== Categorias =====
$route->get("/categorias/list", "Categorias:listAll");
$route->get("/categorias/list/{category_id}", "Categorias:listById");
$route->post("/categorias", "Categorias:insert");
$route->put("/categorias/{category_id}", "Categorias:update");
$route->delete("/categorias/{category_id}", "Categorias:delete");

// ===== Publicacoes =====
$route->get("/publicacoes/list", "Publicacoes:listAll");
$route->get("/publicacoes/list/paginator/{page}/{per_page}", "Publicacoes:listPaginator");
$route->get("/publicacoes/list/{publicacao_id}", "Publicacoes:listById");
$route->post("/publicacoes", "Publicacoes:insert");
$route->put("/publicacoes/{publicacao_id}", "Publicacoes:update");
$route->delete("/publicacoes/{publicacao_id}", "Publicacoes:delete");

// ===== Minhas Publicações =====
$route->get("/minhas-publicacoes/list/paginator/{user_id}/{page}/{per_page}", "MinhasPublicacoes:listPaginatorByUser");
$route->get("/minhas-publicacoes/list/{user_id}", "MinhasPublicacoes:listByUser");

// ===== Curtidas =====
$route->get("/curtidas/list", "Curtidas:listAll");
$route->get("/curtidas/list/paginator/{page}/{per_page}", "Curtidas:listPaginator");
$route->get("/curtidas/list/{curtida_id}", "Curtidas:listById");
$route->get("/curtidas/user/{user_id}", "Curtidas:listByUser");
$route->get("/curtidas/publicacao/{publicacao_id}", "Curtidas:listByPublicacao");
$route->post("/curtidas", "Curtidas:insert");
$route->delete("/curtidas/{curtida_id}", "Curtidas:delete");

// ===== Comentários =====
$route->get("/comentarios/list", "Comentarios:listAll");
$route->get("/comentarios/list/paginator/{page}/{per_page}", "Comentarios:listPaginator");
$route->get("/comentarios/list/{comentario_id}", "Comentarios:listById");
$route->get("/comentarios/user/{user_id}", "Comentarios:listByUser");
$route->get("/comentarios/publicacao/{publicacao_id}", "Comentarios:listByPublicacao");
$route->post("/comentarios", "Comentarios:insert");
$route->delete("/comentarios/{comentario_id}", "Comentarios:delete");

// ===== Receitas Salvas =====
$route->get("/receitas-salvas/list", "ReceitasSalvas:listAll");
$route->get("/receitas-salvas/list/paginator/{page}/{per_page}", "ReceitasSalvas:listPaginator");
$route->get("/receitas-salvas/list/{receita_salva_id}", "ReceitasSalvas:listById");
$route->get("/receitas-salvas/user/{user_id}/{tipo}", "ReceitasSalvas:listByUserByTipo");
$route->get("/receitas-salvas/user/{user_id}", "ReceitasSalvas:listByUser");
$route->post("/receitas-salvas", "ReceitasSalvas:insert");
$route->put("/receitas-salvas/{receita_salva_id}", "ReceitasSalvas:update");
$route->delete("/receitas-salvas/{receita_salva_id}", "ReceitasSalvas:delete");

// ===== Faqs (Categorias) =====
$route->get("/faqs-categories/list", "Faqs:categoryListAll");
$route->get("/faqs-categories/list/{category_id}", "Faqs:categoryListById");
$route->post("/faqs-categories", "Faqs:categoryInsert");
$route->put("/faqs-categories/{category_id}", "Faqs:categoryUpdate");
$route->delete("/faqs-categories/{category_id}", "Faqs:categoryDelete");

// ===== Faqs (Perguntas) =====
$route->get("/faqs/list", "Faqs:listAll");
$route->get("/faqs/list/{faq_id}", "Faqs:listById");
$route->get("/faqs/category/{category_id}", "Faqs:listByCategory");
$route->post("/faqs", "Faqs:insert");
$route->put("/faqs/{faq_id}", "Faqs:update");
$route->delete("/faqs/{faq_id}", "Faqs:delete");

$route->dispatch();

/** ERROR REDIRECT */
if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode([
        "code" => 404,
        "status" => "not_found",
        "message" => "URL não encontrada"
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

ob_end_flush();