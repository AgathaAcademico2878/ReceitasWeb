<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\ReceitasSalva;

class ReceitasSalvas extends Api
{
    public function listById(array $data): void
    {
        if(!isset($data["receita_salva_id"])) {
            $this->call(
                400,
                "bad_request",
                "ID da receita salva é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $receitasSalva = new ReceitasSalva();

        if(!$receitasSalva->selectById($data["receita_salva_id"])) {
            $this->call(
                404,
                "not_found",
                "Receita salva não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $receitasSalva->getId(),
            "user_id" => $receitasSalva->getUserId(),
            "publicacao_id" => $receitasSalva->getPublicacaoId(),
            "tipo" => $receitasSalva->getTipo(),
            "created_at" => $receitasSalva->getCreatedAt()
        ];

        $this->call(200,"success","Receita salva encontrada","success")->back($response);
    }

    public function listAll(array $data): void
    {
        $receitasSalva = new ReceitasSalva();
        $this->call(200,"success","Lista de receitas salvas","success")->back($receitasSalva->selectAll());
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

        $receitasSalva = new ReceitasSalva();
        $result = $receitasSalva->selectPaginator($page, $perPage);

        $this->call(200,"success","Lista paginada de receitas salvas","success")->back($result);
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

        $receitasSalva = new ReceitasSalva();
        $result = $receitasSalva->selectAll(['user_id = ' . $data["user_id"]]);

        $this->call(200,"success","Receitas salvas do usuário","success")->back($result);
    }

    public function listByUserByTipo(array $data): void
    {
        if(!isset($data["user_id"]) || !isset($data["tipo"])) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário e tipo são obrigatórios",
                "error"
            )->back(null);
            return;
        }

        $tipo = $data["tipo"];
        if(!in_array($tipo, ['quero_fazer', 'ja_fiz'])) {
            $this->call(
                400,
                "bad_request",
                "Tipo inválido. Use 'quero_fazer' ou 'ja_fiz'",
                "error"
            )->back(null);
            return;
        }

        $receitasSalva = new ReceitasSalva();
        $result = $receitasSalva->selectAll(['user_id = ' . $data["user_id"], "tipo = '" . $tipo . "'"]);

        $this->call(200,"success","Receitas salvas do usuário por tipo","success")->back($result);
    }

    public function insert(array $data): void
    {
        if(!$this->validate($data)) {
            return;
        }

        $receitasSalva = new ReceitasSalva(null, $data["user_id"], $data["publicacao_id"], $data["tipo"]);

        if(!$receitasSalva->insert()) {
            $this->call(500, "internal_server_error", $receitasSalva->getErrorMessage(), "error")->back();
            return;
        }

        $response = [
            "id" => $receitasSalva->getId(),
            "user_id" => $receitasSalva->getUserId(),
            "publicacao_id" => $receitasSalva->getPublicacaoId(),
            "tipo" => $receitasSalva->getTipo(),
            "created_at" => $receitasSalva->getCreatedAt()
        ];

        $this->call(201,"success","Receita salva com sucesso","success")->back($response);
    }

    public function update(array $data): void
    {
        $data = $this->mergeJsonBody($data);

        if(!isset($data["receita_salva_id"]) || !filter_var($data["receita_salva_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da receita salva é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        if(!isset($data["tipo"]) || !in_array($data["tipo"], ['quero_fazer', 'ja_fiz'])) {
            $this->call(
                400,
                "bad_request",
                "Tipo inválido. Use 'quero_fazer' ou 'ja_fiz'",
                "error"
            )->back(null);
            return;
        }

        $receitasSalva = new ReceitasSalva(null, null, null, $data["tipo"]);

        if(!$receitasSalva->updateById($data["receita_salva_id"])) {
            $this->call(500, "internal_server_error", $receitasSalva->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200,"success","Receita salva atualizada com sucesso","success")->back();
    }

    public function delete(array $data): void
    {
        if(!isset($data["receita_salva_id"]) || !filter_var($data["receita_salva_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da receita salva é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $receitasSalva = new ReceitasSalva();

        if(!$receitasSalva->deleteById($data["receita_salva_id"])) {
            $this->call(500, "internal_server_error", $receitasSalva->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200,"success","Receita salva removida com sucesso","success")->back();
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

        if(!isset($data["tipo"]) || !in_array($data["tipo"], ['quero_fazer', 'ja_fiz'])) {
            $this->call(
                400,
                "bad_request",
                "Tipo inválido. Use 'quero_fazer' ou 'ja_fiz'",
                "error"
            )->back(null);
            return false;
        }

        return true;
    }
}