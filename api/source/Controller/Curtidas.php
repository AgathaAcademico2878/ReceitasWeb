<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Curtida;

class Curtidas extends Api
{
    public function listById(array $data): void
    {
        if(!isset($data["curtida_id"])) {
            $this->call(
                400,
                "bad_request",
                "ID da curtida é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $curtida = new Curtida();

        if(!$curtida->selectById($data["curtida_id"])) {
            $this->call(
                404,
                "not_found",
                "Curtida não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $curtida->getId(),
            "user_id" => $curtida->getUserId(),
            "publicacao_id" => $curtida->getPublicacaoId(),
            "created_at" => $curtida->getCreatedAt()
        ];

        $this->call(200,"success","Curtida encontrada","success")->back($response);
    }

    public function listAll(array $data): void
    {
        $curtida = new Curtida();
        $this->call(200,"success","Lista de Curtidas","success")->back($curtida->selectAll());
    }

    public function listPaginator(array $data): void
    {
        if(!isset($data["page"]) || !isset($data["per_page"])) {
            $this->call(
                400,
                "bad_request",
                "Página e quantidade por página são obrigatórios",
                "error"
            )->back(null);
            return;
        }

        $page = filter_var($data["page"], FILTER_VALIDATE_INT);
        $perPage = filter_var($data["per_page"], FILTER_VALIDATE_INT);

        if($page === false || $perPage === false || $page <= 0 || $perPage <= 0) {
            $this->call(
                400,
                "bad_request",
                "Página e quantidade por página devem ser números inteiros positivos",
                "error"
            )->back(null);
            return;
        }

        $curtida = new Curtida();
        $result = $curtida->selectPaginator($page, $perPage, [], 'id', 'ASC');

        $this->call(200,"success","Lista paginada de curtidas","success")->back($result);
    }

    public function listByUser(array $data): void
    {
        if(!isset($data["user_id"]) || !filter_var($data["user_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $curtida = new Curtida();
        $result = $curtida->selectAll(['user_id = ' . $data["user_id"]]);

        $this->call(200,"success","Curtidas do usuário","success")->back($result);
    }

    public function listByPublicacao(array $data): void
    {
        if(!isset($data["publicacao_id"]) || !filter_var($data["publicacao_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da publicação é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $curtida = new Curtida();
        $result = $curtida->selectAll(['publicacao_id = ' . $data["publicacao_id"]]);

        $this->call(200,"success","Curtidas da publicação","success")->back($result);
    }

    public function insert(array $data): void
    {
        if(!$this->validate($data)) {
            return;
        }

        $curtida = new Curtida(null, $data["user_id"], $data["publicacao_id"]);

        if(!$curtida->insert()) {
            $this->call(500, "internal_server_error", $curtida->getErrorMessage(), "error")->back();
            return;
        }

        $response = [
            "id" => $curtida->getId(),
            "user_id" => $curtida->getUserId(),
            "publicacao_id" => $curtida->getPublicacaoId()
        ];

        $this->call(201,"success","Publicação curtida com sucesso","success")->back($response);
    }

    public function delete(array $data): void
    {
        if(!isset($data["curtida_id"]) || !filter_var($data["curtida_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da curtida é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $curtida = new Curtida();

        if(!$curtida->deleteById($data["curtida_id"])) {
            $this->call(500, "internal_server_error", $curtida->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200,"success","Curtida removida com sucesso","success")->back();
    }

    public function validate(array $data): bool
    {
        if(!isset($data["user_id"]) || empty($data["user_id"]) || !filter_var($data["user_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return false;
        }

        if(!isset($data["publicacao_id"]) || empty($data["publicacao_id"]) || !filter_var($data["publicacao_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da publicação é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return false;
        }

        return true;
    }
}