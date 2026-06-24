<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\MinhaPublicacao;

class MinhasPublicacoes extends Api
{
    public function listByUser(array $data): void
    {
        if(!isset($data["user_id"]) || empty($data["user_id"]) || !filter_var($data["user_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $model = new MinhaPublicacao();
        $result = $model->selectByUserId($data["user_id"]);

        $this->call(200,"success","Minhas publicações","success")->back($result);
    }

    public function listPaginatorByUser(array $data): void
    {
        if(!isset($data["user_id"]) || !isset($data["page"]) || !isset($data["per_page"])) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário, página e quantidade por página são obrigatórios",
                "error"
            )->back(null);
            return;
        }

        $userId = filter_var($data["user_id"], FILTER_VALIDATE_INT);
        $page = filter_var($data["page"], FILTER_VALIDATE_INT);
        $perPage = filter_var($data["per_page"], FILTER_VALIDATE_INT);

        if($userId === false || $page === false || $perPage === false || $page <= 0 || $perPage <= 0) {
            $this->call(
                400,
                "bad_request",
                "Todos os parâmetros devem ser números inteiros positivos",
                "error"
            )->back(null);
            return;
        }

        $model = new MinhaPublicacao();
        $result = $model->selectPaginatorByUserId($page, $perPage, $userId);

        $this->call(200,"success","Minhas publicações paginadas","success")->back($result);
    }
}