<?php

namespace Source\Controller;

use Source\Models\Categoria;

class Categorias extends Api
{
    public function listById(array $data): void
    {
        if (
            !isset($data["category_id"]) || empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $categoria = new Categoria();
        if (!$categoria->selectById((int) $data["category_id"])) {
            $this->call(404, "not_found", "Categoria não encontrada", "error")->back(null);
            return;
        }

        $response = [
            "id" => $categoria->getId(),
            "name" => $categoria->getName(),
            "active" => $categoria->getActive()
        ];

        $this->call(200, "success", "Categoria encontrada", "success")->back($response);
    }

    public function listAll(array $data): void
    {
        $categorias = new Categoria();
        $this->call(200, "success", "Lista de Categorias", "success")
            ->back($categorias->selectAll(["active = 1"], "name", "ASC"));
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores podem criar categorias.", "error")->back(null);
            return;
        }

        if (!isset($data["name"]) || empty($data["name"])) {
            $this->call(400, "bad_request", "Nome da categoria é obrigatório", "error")->back(null);
            return;
        }

        $categoria = new Categoria();
        $categoria->setName($data["name"]);
        $categoria->setActive(1);

        if (!$categoria->insert()) {
            $this->call(500, "internal_server_error", $categoria->getErrorMessage(), "error")->back(null);
            return;
        }

        $response = [
            "id" => $categoria->getId(),
            "name" => $categoria->getName()
        ];

        $this->call(201, "success", "Categoria inserida com sucesso", "created")->back($response);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores podem atualizar categorias.", "error")->back(null);
            return;
        }

        if (
            !isset($data["category_id"]) || empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $categoria = new Categoria();
        if (!$categoria->selectById((int) $data["category_id"])) {
            $this->call(404, "not_found", "Categoria não encontrada", "error")->back(null);
            return;
        }

        if (!isset($data["name"]) || empty($data["name"])) {
            $this->call(400, "bad_request", "Nome da categoria é obrigatório", "error")->back(null);
            return;
        }

        $categoria->setName($data["name"]);

        if (isset($data["active"])) {
            $categoria->setActive((int) $data["active"]);
        }

        if (!$categoria->updateById((int) $data["category_id"])) {
            $this->call(500, "internal_server_error", $categoria->getErrorMessage(), "error")->back(null);
            return;
        }

        $response = [
            "id" => $categoria->getId(),
            "name" => $categoria->getName()
        ];

        $this->call(200, "success", "Categoria atualizada com sucesso", "success")->back($response);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores podem excluir categorias.", "error")->back(null);
            return;
        }

        if (
            !isset($data["category_id"]) || empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $categoria = new Categoria();
        if (!$categoria->selectById((int) $data["category_id"])) {
            $this->call(404, "not_found", "Categoria não encontrada", "error")->back(null);
            return;
        }

        if (!$categoria->softDeleteById((int) $data["category_id"])) {
            $this->call(500, "internal_server_error", $categoria->getErrorMessage(), "error")->back(null);
            return;
        }

        $this->call(200, "success", "Categoria excluída com sucesso", "success")->back(null);
    }
}