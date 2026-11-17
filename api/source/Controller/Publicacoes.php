<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Publicacao;
use Source\Support\Upload;

class Publicacoes extends Api
{
    public function listById(array $data): void
    {
        if (!isset($data["publicacao_id"]) || empty($data["publicacao_id"]) || !filter_var($data["publicacao_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da publicação é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $publicacao = new Publicacao();

        // Use custom query with JOIN to get author info
        $result = $publicacao->selectByIdWithAuthor((int) $data["publicacao_id"]);

        if (!$result) {
            $this->call(
                404,
                "not_found",
                "Publicação não encontrada",
                "error"
            )->back(null);
            return;
        }

        $this->call(200, "success", "Publicação encontrada", "success")->back($result);
    }

    public function listAll(array $data): void
    {
        $publicacao = new Publicacao();
        $filters = [];

        if (isset($data["category_id"]) && !empty($data["category_id"]) && filter_var($data["category_id"], FILTER_VALIDATE_INT)) {
            $filters[] = "p.category_id = " . (int)$data["category_id"];
        }

        $filters[] = "p.active = 1";

        $this->call(200, "success", "Lista de publicações", "success")->back($publicacao->selectAllWithAuthor($filters, 'p.created_at', 'DESC'));
    }

    public function listPaginator(array $data): void
    {
        if (
            !isset($data["page"]) || !isset($data["per_page"]) ||
            empty($data["page"]) || empty($data["per_page"]) ||
            !filter_var($data["page"], FILTER_VALIDATE_INT) ||
            !filter_var($data["per_page"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "Parâmetros 'page' e 'per_page' são obrigatórios e devem ser inteiros",
                "error"
            )->back(null);
            return;
        }

        $page = (int) $data["page"];
        $perPage = (int) $data["per_page"];

        $filters = ["p.active = 1"];
        if (isset($data["category_id"]) && !empty($data["category_id"]) && filter_var($data["category_id"], FILTER_VALIDATE_INT)) {
            $filters[] = "p.category_id = " . (int)$data["category_id"];
        }

        $publicacao = new Publicacao();
        $result = $publicacao->selectPaginatorWithAuthor($page, $perPage, $filters, 'p.created_at', 'DESC');

        $this->call(200, "success", "Lista paginada de publicações", "success")->back($result);
    }

    public function insert(array $data): void
    {
        // Requires auth token level 2 (regular users)
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token inválido ou expirado", "error")->back(null);
            return;
        }

        $userId = $this->userAuthId;

        // Validate required fields
        if (
            !isset($data["category_id"], $data["title"], $data["description"]) ||
            empty($data["category_id"]) || empty($data["title"]) || empty($data["description"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "Campos obrigatórios: category_id (int), title, description", "error")->back(null);
            return;
        }

        // Handle photo upload if provided
        $photo = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $upload = new Upload();
            $photo = $upload->image($_FILES['photo'], 'uploads/publicacoes');
            if (!$photo) {
                $this->call(400, "bad_request", $upload->getError() ?? "Erro ao fazer upload da imagem", "error")->back(null);
                return;
            }
        }

        $publicacao = new Publicacao(
            null,
            $userId,
            (int) $data["category_id"],
            $data["title"],
            $data["description"],
            $photo,
            null,
            null,
            1
        );

        if (!$publicacao->insert()) {
            $this->call(500, "server_error", $publicacao->getErrorMessage() ?? "Erro ao criar publicação", "error")->back(null);
            return;
        }

        $this->call(201, "created", "Publicação criada com sucesso", "success")->back([
            "id" => $publicacao->getId(),
            "user_id" => $publicacao->getUserId(),
            "category_id" => $publicacao->getCategoryId(),
            "title" => $publicacao->getTitle(),
            "description" => $publicacao->getDescription(),
            "photo" => $publicacao->getPhoto(),
            "active" => $publicacao->getActive()
        ]);
    }

    public function update(array $data): void
    {
        // Requires auth token level 2 (regular users)
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token inválido ou expirado", "error")->back(null);
            return;
        }

        $userId = $this->userAuthId;

        // Validate required fields
        if (
            !isset($data["publicacao_id"], $data["category_id"], $data["title"], $data["description"]) ||
            empty($data["publicacao_id"]) || empty($data["category_id"]) || empty($data["title"]) || empty($data["description"]) ||
            !filter_var($data["publicacao_id"], FILTER_VALIDATE_INT) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "Campos obrigatórios: publicacao_id (int), category_id (int), title, description", "error")->back(null);
            return;
        }

        $publicacaoId = (int) $data["publicacao_id"];

        // Check if publication exists and belongs to user
        $publicacao = new Publicacao();
        if (!$publicacao->selectById($publicacaoId)) {
            $this->call(404, "not_found", "Publicação não encontrada", "error")->back(null);
            return;
        }

        // Verify ownership
        if ($publicacao->getUserId() !== $userId) {
            $this->call(403, "forbidden", "Você não tem permissão para editar esta publicação", "error")->back(null);
            return;
        }

        // Handle photo upload if provided
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $upload = new Upload();
            $photo = $upload->image($_FILES['photo'], 'uploads/publicacoes');
            if (!$photo) {
                $this->call(400, "bad_request", $upload->getError() ?? "Erro ao fazer upload da imagem", "error")->back(null);
                return;
            }
            // Delete old photo if exists
            if ($publicacao->getPhoto()) {
                $oldPhotoPath = __DIR__ . '/../../../uploads/' . $publicacao->getPhoto();
                if (file_exists($oldPhotoPath)) {
                    @unlink($oldPhotoPath);
                }
            }
            $publicacao->setPhoto($photo);
        }

        // Update publication
        $publicacao->setCategoryId((int) $data["category_id"]);
        $publicacao->setTitle($data["title"]);
        $publicacao->setDescription($data["description"]);

        if (!$publicacao->updateById($publicacaoId)) {
            $this->call(500, "server_error", $publicacao->getErrorMessage() ?? "Erro ao atualizar publicação", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Publicação atualizada com sucesso", "success")->back([
            "id" => $publicacao->getId(),
            "user_id" => $publicacao->getUserId(),
            "category_id" => $publicacao->getCategoryId(),
            "title" => $publicacao->getTitle(),
            "description" => $publicacao->getDescription(),
            "photo" => $publicacao->getPhoto(),
            "active" => $publicacao->getActive()
        ]);
    }

    public function delete(array $data): void
    {
        // Requires auth token level 1 (admin) OR level 2 (regular users)
        if (!$this->authToken(1) && !$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token inválido ou expirado", "error")->back(null);
            return;
        }

        $userId = $this->userAuthId;

        // Check if user is admin
        $user = new \Source\Models\User();
        $user->selectById($userId);
        $isAdmin = $user->getTypeId() === 1;

        if (!isset($data["publicacao_id"]) || empty($data["publicacao_id"]) || !filter_var($data["publicacao_id"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da publicação é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $publicacaoId = (int) $data["publicacao_id"];

        // Check if publication exists
        $publicacao = new Publicacao();
        if (!$publicacao->selectById($publicacaoId)) {
            $this->call(404, "not_found", "Publicação não encontrada", "error")->back(null);
            return;
        }

        // Verify ownership (only for non-admins)
        if (!$isAdmin && $publicacao->getUserId() !== $userId) {
            $this->call(403, "forbidden", "Você não tem permissão para excluir esta publicação", "error")->back(null);
            return;
        }

        // Delete photo file if exists
        if ($publicacao->getPhoto()) {
            $photoPath = __DIR__ . '/../../../uploads/' . $publicacao->getPhoto();
            if (file_exists($photoPath)) {
                @unlink($photoPath);
            }
        }

        // Soft delete
        if (!$publicacao->softDeleteById($publicacaoId)) {
            $this->call(500, "server_error", $publicacao->getErrorMessage() ?? "Erro ao excluir publicação", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Publicação excluída com sucesso", "success")->back(null);
    }

    public function uploadPhoto(array $data): void
    {
        // Requires auth token level 2 (regular users)
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token inválido ou expirado", "error")->back(null);
            return;
        }

        $userId = $this->userAuthId;

        if (!isset($data["publicacao_id"]) || empty($data["publicacao_id"]) || !filter_var($data["publicacao_id"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da publicação é obrigatório", "error")->back(null);
            return;
        }

        $publicacaoId = (int) $data["publicacao_id"];

        // Check if publication exists and belongs to user
        $publicacao = new Publicacao();
        if (!$publicacao->selectById($publicacaoId)) {
            $this->call(404, "not_found", "Publicação não encontrada", "error")->back(null);
            return;
        }

        // Verify ownership
        if ($publicacao->getUserId() !== $userId) {
            $this->call(403, "forbidden", "Você não tem permissão para editar esta publicação", "error")->back(null);
            return;
        }

        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            $this->call(400, "bad_request", "Arquivo de imagem é obrigatório", "error")->back(null);
            return;
        }

        $upload = new Upload();
        $photo = $upload->image($_FILES['photo'], 'uploads/publicacoes');
        if (!$photo) {
            $this->call(400, "bad_request", $upload->getError() ?? "Erro ao fazer upload da imagem", "error")->back(null);
            return;
        }

        // Delete old photo if exists
        if ($publicacao->getPhoto()) {
            $oldPhotoPath = __DIR__ . '/../../../uploads/' . $publicacao->getPhoto();
            if (file_exists($oldPhotoPath)) {
                @unlink($oldPhotoPath);
            }
        }

        $publicacao->setPhoto($photo);

        if (!$publicacao->updateById($publicacaoId)) {
            $this->call(500, "server_error", $publicacao->getErrorMessage() ?? "Erro ao atualizar publicação", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Foto da publicação atualizada com sucesso", "success")->back([
            "id" => $publicacao->getId(),
            "photo" => $publicacao->getPhoto()
        ]);
    }

    /**
     * Validate required fields for create/update
     */
    public function validate(array $data): bool
    {
        if (
            !isset($data["category_id"], $data["title"], $data["description"]) ||
            empty($data["category_id"]) || empty($data["title"]) || empty($data["description"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }

        return true;
    }
}