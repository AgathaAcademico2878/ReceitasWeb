<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
// timezone para São Paulo América
date_default_timezone_set('America/Sao_Paulo');

ob_start();

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
$route->get("/publicacoes/list/{publicacao_id}", "Publicacoes:listById");
$route->get("/publicacoes/list/paginator/{page}/{per_page}", "Publicacoes:listPaginator");
$route->post("/publicacoes", "Publicacoes:insert");
$route->put("/publicacoes/{publicacao_id}", "Publicacoes:update");
$route->delete("/publicacoes/{publicacao_id}", "Publicacoes:delete");

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