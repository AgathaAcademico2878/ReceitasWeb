<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Publicacao;

class Publicacoes extends Api
{ 
    /*id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments LONGTEXT NULL,
    likes LONGTEXT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,*/

    public function listById(array $data): void
    {
        if(!isset($data["publicacao_id"])/* || empty($data["user_id"]) || !filter_var($data["user_id"] FILTER_VALIDATE_INT)*/) {
            $this->call(
                400,
                "bad_request",
                "ID do produto é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $publicacao = new Publicacao();

        if(!$publicacao->selectById($data["publicacao_id"])) {
            $this->call(
                404,
                "not_found",
                "Publicação não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $publicacao->getId(),
            "category_id" => $publicacao->getCategoryId(),
            "title" => $publicacao->getTitle(),
            "description" => $publicacao->getDescription(),
            "created_at" => $publicacao->getCreatedAt(),
            "comments" => $publicacao->getComments(),
            "likes" => $publicacao->getLikes(),
            "active" => $publicacao->getActive()
        ];

        $this->call(200,"success","Publicação encontrada","success")->back($response);
    }

    public function listAll (array $data): void
    {
        $publicacao = new Publicacao();
      $this->call(200,"success","Lista de Produtos","success")->back($publicacao->selectAll(['active = 1']));
    }

    public function listPaginator (array $data): void
    {
        if(!isset($data["page"]) || !isset($data["per_page"]) ||
            empty($data["page"]) || empty($data["per_page"]) ||
            !filter_var($data["page"], FILTER_VALIDATE_INT) ||
            !filter_var($data["per_page"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "Os campos page e per_page são obrigatórios, devem ser números inteiros e maiores que zero",
                "error"
            )->back(null);
            return;
        }

        $publicacao  = new Publicacao();
        $response = $publicacao->selectPaginator($data["page"], $data["per_page"], ['active = 1'], 'id', 'ASC');
        $this->call(200,"success","Lista de Publicações com Paginação","success")->back($response);
    }

    public function insert (array $data): void
    {
        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos category_id, title e description são obrigatórios",
                "error"
            )->back(null);
            return;
        }
        /*  "id"
            "category_id"
            "title"
            "description"
            "created_at"
            "comments"
            "likes"
            "active" */
        $publicacao = new Publicacao(
            null,
            (int)$data["user_id"],
            (int)$data["category_id"],
            $data["title"],
            $data["description"]
        );

        if(!$publicacao->insert()){
            $this->call(500, "internal_server_error", $publicacao->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $publicacao->getId(),
            "category_id" => $publicacao->getCategoryId(),
            "title" => $publicacao->getTitle(),
            "description" => $publicacao->getDescription(),
            "active" => $publicacao->getActive()
        ];

        $this->call(201,"success","Publicação inserida com sucesso","success")->back($response);

    }

    public function update (array $data): void
    {
        $data = $this->mergeJsonBody($data);

        if(!isset($data["publicacao_id"]) || !filter_var($data["publicacao_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da publicação é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos category_id, title e description são obrigatórios",
                "error"
            )->back(null);
            return;
        }

        $publicacao = new Publicacao(
            null,
            (int)$data["user_id"],
            (int)$data["category_id"],
            $data["title"],
            $data["description"]
        );

        if(!$publicacao->updateById($data["publicacao_id"])){
            $this->call(500, "internal_server_error", $publicacao->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $publicacao->getId(),
            "category_id" => $publicacao->getCategoryId(),
            "title" => $publicacao->getTitle(),
            "description" => $publicacao->getDescription(),
            "active" => $publicacao->getActive()
        ];

        $this->call(200,"success","Publicação atualizada com sucesso","success")->back($response);
    }

    public function delete (array $data): void
    {
        if(!filter_var($data["publicacao_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da publicação é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $publicacao = new Publicacao();
                // soft delete (FKs impedem hard delete)
        if(!$publicacao->softDeleteById($data["publicacao_id"])){
            $this->call(500, "internal_server_error", $publicacao->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200,"success","Publicação excluída com sucesso","success")->back();
    }

    /*
    public function newList (array $data): void
    {
        echo "Olá, Mundo!!";

        /**
         * SELEÇÃO DE TODOS OS PRODUTOS
         */
/*
        $product = new Product();
        var_dump($product->selectAll());
*/

        /**
         * SELEÇÃO DE PRODUTOS COM PAGINAÇÃO
         */
        /*
        $product = new Product();
        var_dump($product->selectPaginator(1, 10, [], 'id', 'ASC'));

        /**
         * INCLUSÃO
         */
/*
        $product = new Product(
            null,
            3,
            "Notebook",
            1000.00
        );

        var_dump($product);

        if(!$product->insert()){
            var_dump($product->getErrorMessage());
        }
        else {
            var_dump("Inserido com sucesso!");
        }

        var_dump($product);*/

        /**
         * ALTERAÇÃO
         */
/*
        $product = new Product(
            null,
            2,
            "Smartphone",
            500.00
        );

        var_dump($product);

        if(!$product->updateById(54)){
            var_dump($product->getErrorMessage());
        }
        else{
            var_dump("Atualizado com sucesso!");
        }
        var_dump($product);
*/
        /**
         * EXCLUSÃO - HARD
         */
/*
        $product = new Product();
        var_dump($product);
        if(!$product->deleteById(25)){
            var_dump($product->getErrorMessage());
        }
        else{
            var_dump("Excluído com sucesso!");
        }
*/

        /**
         * EXCLUSÃO - SOFT
         */
/*
        $product = new Product();
        if(!$product->softDeleteById(24))
        {
            var_dump($product->getErrorMessage());
        } else
        {
            var_dump("Excluído com sucesso!");
        }
*/

  //  }

    public function validate (array $data): bool
    {
        if(!isset($data["category_id"]) || !isset($data["title"]) || !isset($data["description"]) ||
            empty($data["category_id"]) || empty($data["title"]) || empty($data["description"]) ||
           !filter_var($data["category_id"], FILTER_VALIDATE_INT)) {
            return false;
        }
        return true;
    }
}