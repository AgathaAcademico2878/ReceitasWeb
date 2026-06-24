<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Comentario;

class Comentarios extends Api
{
    public function listById(array $data): void
    {
        if(!isset($data["comentario_id"])) {
            $this->call(
                400,
                "bad_request",
                "ID do comentário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $comentario = new Comentario();

        if(!$comentario->selectById($data["comentario_id"])) {
            $this->call(
                404,
                "not_found",
                "Comentário não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $comentario->getId(),
            "user_id" => $comentario->getUserId(),
            "publicacao_id" => $comentario->getPublicacaoId(),
            "comment" => $comentario->getComment(),
            "created_at" => $comentario->getCreatedAt()
        ];

        $this->call(200,"success","Comentário encontrado","success")->back($response);
    }

    public function listAll(array $data): void
    {
        $comentario = new Comentario();
        $this->call(200,"success","Lista de Comentários","success")->back($comentario->selectAll());
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

        $comentario = new Comentario();
        $result = $comentario->selectPaginator($page, $perPage, [], 'id', 'ASC');

        $this->call(200,"success","Lista paginada de comentários","success")->back($result);
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

        $comentario = new Comentario();
        $result = $comentario->selectAll(['user_id = ' . $data["user_id"]]);

        $this->call(200,"success","Comentários do usuário","success")->back($result);
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

        $comentario = new Comentario();
        $result = $comentario->selectAll(['publicacao_id = ' . $data["publicacao_id"]]);

        $this->call(200,"success","Comentários da publicação","success")->back($result);
    }

    public function insert(array $data): void
    {
        if(!$this->validate($data)) {
            return;
        }

        $comentario = new Comentario(null, $data["user_id"], $data["publicacao_id"], $data["comment"]);

        if(!$comentario->insert()) {
            $this->call(500, "internal_server_error", $comentario->getErrorMessage(), "error")->back();
            return;
        }

        $response = [
            "id" => $comentario->getId(),
            "user_id" => $comentario->getUserId(),
            "publicacao_id" => $comentario->getPublicacaoId(),
            "comment" => $comentario->getComment(),
            "created_at" => $comentario->getCreatedAt()
        ];

        $this->call(201,"success","Comentário adicionado com sucesso","success")->back($response);
    }

    public function delete(array $data): void
    {
        if(!isset($data["comentario_id"]) || !filter_var($data["comentario_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do comentário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $comentario = new Comentario();

        if(!$comentario->deleteById($data["comentario_id"])) {
            $this->call(500, "internal_server_error", $comentario->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200,"success","Comentário removido com sucesso","success")->back();
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

        if(!isset($data["comment"]) || empty(trim($data["comment"]))) {
            $this->call(
                400,
                "bad_request",
                "O comentário não pode estar vazio",
                "error"
            )->back(null);
            return false;
        }

        return true;
    }
}