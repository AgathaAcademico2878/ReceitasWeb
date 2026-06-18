<?php

namespace Source\Controller;

use Source\Models\Faq;
use Source\Models\FaqCategory;

class Faqs extends Api
{

    public function categoryListAll(): void
    {
        $category = new FaqCategory();
        $this->call(200, "success", "Lista de categorias de FAQ", "success")
            ->back($category->selectAll(["active = 1"], "name", "ASC"));
    }

    public function categoryListById(array $data): void
    {
        if (
            !isset($data["category_id"]) || empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int) $data["category_id"])) {
            $this->call(404, "not_found", "Categoria de FAQ não encontrada", "error")->back(null);
            return;
        }

        $response = [
            "id" => $category->getId(),
            "name" => $category->getName(),
            "active" => $category->getActive()
        ];

        $this->call(200, "success", "Categoria de FAQ encontrada", "success")->back($response);
    }

    public function categoryInsert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores.", "error")->back(null);
            return;
        }

        if (!isset($data["name"]) || empty($data["name"])) {
            $this->call(400, "bad_request", "Nome da categoria é obrigatório", "error")->back(null);
            return;
        }

        $category = new FaqCategory();
        $category->setName($data["name"]);
        $category->setActive(1);

        if (!$category->insert()) {
            $this->call(500, "internal_server_error", $category->getErrorMessage(), "error")->back(null);
            return;
        }

        $response = [
            "id" => $category->getId(),
            "name" => $category->getName()
        ];

        $this->call(201, "success", "Categoria de FAQ inserida com sucesso", "created")->back($response);
    }

    public function categoryUpdate(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores.", "error")->back(null);
            return;
        }

        if (
            !isset($data["category_id"]) || empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int) $data["category_id"])) {
            $this->call(404, "not_found", "Categoria de FAQ não encontrada", "error")->back(null);
            return;
        }

        if (!isset($data["name"]) || empty($data["name"])) {
            $this->call(400, "bad_request", "Nome da categoria é obrigatório", "error")->back(null);
            return;
        }

        $category->setName($data["name"]);

        if (isset($data["active"])) {
            $category->setActive((int) $data["active"]);
        }

        if (!$category->updateById((int) $data["category_id"])) {
            $this->call(500, "internal_server_error", $category->getErrorMessage(), "error")->back(null);
            return;
        }

        $response = [
            "id" => $category->getId(),
            "name" => $category->getName()
        ];

        $this->call(200, "success", "Categoria de FAQ atualizada com sucesso", "success")->back($response);
    }

    public function categoryDelete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores.", "error")->back(null);
            return;
        }

        if (
            !isset($data["category_id"]) || empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int) $data["category_id"])) {
            $this->call(404, "not_found", "Categoria de FAQ não encontrada", "error")->back(null);
            return;
        }

        if (!$category->softDeleteById((int) $data["category_id"])) {
            $this->call(500, "internal_server_error", $category->getErrorMessage(), "error")->back(null);
            return;
        }

        $this->call(200, "success", "Categoria de FAQ excluída com sucesso", "success")->back(null);
    }

    // ===== Perguntas Frequentes (FAQs) =====

    public function listAll(): void
    {
        $faq = new Faq();
        $this->call(200, "success", "Lista de FAQs", "success")
            ->back($faq->selectAll(["active = 1"], "id", "ASC"));
    }

    public function listByCategory(array $data): void
    {
        if (
            !isset($data["category_id"]) || empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $faq = new Faq();
        $this->call(200, "success", "Lista de FAQs por categoria", "success")
            ->back($faq->selectAll(
                ["active = 1", "faqs_category_id = " . (int) $data["category_id"]],
                "id",
                "ASC"
            ));
    }

    public function listById(array $data): void
    {
        if (
            !isset($data["faq_id"]) || empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da FAQ é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int) $data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrada", "error")->back(null);
            return;
        }

        $response = [
            "id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ];

        $this->call(200, "success", "FAQ encontrada", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores.", "error")->back(null);
            return;
        }

        $missing = [];
        if (!isset($data["faqs_category_id"]) || empty($data["faqs_category_id"])) {
            $missing[] = "faqs_category_id";
        }
        if (!isset($data["question"]) || empty($data["question"])) {
            $missing[] = "question";
        }
        if (!isset($data["answer"]) || empty($data["answer"])) {
            $missing[] = "answer";
        }

        if (!empty($missing)) {
            $this->call(400, "bad_request", "Campos obrigatórios: " . implode(", ", $missing), "error")->back(null);
            return;
        }

        $faq = new Faq();
        $faq->setFaqsCategoryId((int) $data["faqs_category_id"]);
        $faq->setQuestion($data["question"]);
        $faq->setAnswer($data["answer"]);
        $faq->setActive(1);

        if (!$faq->insert()) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back(null);
            return;
        }

        $response = [
            "id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer()
        ];

        $this->call(201, "success", "FAQ inserida com sucesso", "created")->back($response);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores.", "error")->back(null);
            return;
        }

        if (
            !isset($data["faq_id"]) || empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da FAQ é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int) $data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrada", "error")->back(null);
            return;
        }

        if (isset($data["faqs_category_id"])) {
            $faq->setFaqsCategoryId((int) $data["faqs_category_id"]);
        }
        if (isset($data["question"])) {
            $faq->setQuestion($data["question"]);
        }
        if (isset($data["answer"])) {
            $faq->setAnswer($data["answer"]);
        }
        if (isset($data["active"])) {
            $faq->setActive((int) $data["active"]);
        }

        if (!$faq->updateById((int) $data["faq_id"])) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back(null);
            return;
        }

        $response = [
            "id" => $faq->getId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer()
        ];

        $this->call(200, "success", "FAQ atualizada com sucesso", "success")->back($response);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Não autorizado. Apenas administradores.", "error")->back(null);
            return;
        }

        if (
            !isset($data["faq_id"]) || empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID da FAQ é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int) $data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrada", "error")->back(null);
            return;
        }

        if (!$faq->softDeleteById((int) $data["faq_id"])) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back(null);
            return;
        }

        $this->call(200, "success", "FAQ excluída com sucesso", "success")->back(null);
    }
}