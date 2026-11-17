<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Support\Upload;

class Users extends Api
{
    public function listById(array $data): void
    {
        if (
            !isset($data["user_id"]) ||
            empty($data["user_id"]) ||
            !filter_var($data["user_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $user = new User();

        if (!$user->selectById($data["user_id"])) {
            $this->call(
                404,
                "not_found",
                "Usuário não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhotoUrl($user->getId(), $user->getTypeId()),
            "active" => $user->getActive()
        ];

        $this->call(
            200,
            "success",
            "Usuário encontrado",
            "success"
        )->back($response);
    }

    public function listAll(array $data): void
    {
        $users = new User();

        $this->call(
            200,
            "success",
            "Lista de Usuários",
            "success"
        )->back($users->selectAll());
    }

    public function listPaginator(array $data): void
    {
        if (
            !isset($data["page"]) ||
            !isset($data["per_page"]) ||
            empty($data["page"]) ||
            empty($data["per_page"]) ||
            !filter_var($data["page"], FILTER_VALIDATE_INT) ||
            !filter_var($data["per_page"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "Os campos page e per_page são obrigatórios, devem ser números inteiros e maiores que zero",
                "error"
            )->back(null);
            return;
        }

        $users = new User();

        $response = $users->selectPaginator(
            $data["page"],
            $data["per_page"],
            [],
            "id",
            "ASC"
        );

        $this->call(
            200,
            "success",
            "Lista de Usuários com Paginação",
            "success"
        )->back($response);
    }

    public function register(array $data): void
    {
        $data = $this->mergeJsonBody($data);

        // Handle photo upload if provided
        $photo = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $upload = new Upload();
            $photo = $upload->image($_FILES['photo'], 'users');
            if (!$photo) {
                $this->call(400, "bad_request", $upload->getError() ?? "Erro ao fazer upload da imagem", "error")->back(null);
                return;
            }
        }

        if (
            !$this->validate($data) ||
            !isset($data["password"]) ||
            empty($data["password"])
        ) {
            $this->call(
                400,
                "bad_request",
                "Os campos name, email e password são obrigatórios",
                "error"
            )->back();
            return;
        }

        $checkUser = new User();

        if ($checkUser->emailExists($data["email"])) {
            $this->call(
                400,
                "bad_request",
                "E-mail já cadastrado",
                "error"
            )->back();
            return;
        }

        $typeId = 2;

        $user = new User(
            null,
            $typeId,
            $data["name"],
            $data["email"],
            $data["password"],
            $photo
        );

        if (!$user->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhotoUrl(),
            "active" => $user->getActive()
        ];

        $this->call(
            201,
            "success",
            "Usuário inserido com sucesso",
            "success"
        )->back($response);
    }
      public function registerAdmin(array $data): void
    {
        $data = $this->mergeJsonBody($data);

        // Handle photo upload if provided
        $photo = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $upload = new Upload();
            $photo = $upload->image($_FILES['photo'], 'users');
            if (!$photo) {
                $this->call(400, "bad_request", $upload->getError() ?? "Erro ao fazer upload da imagem", "error")->back(null);
                return;
            }
        }

        if (
            !$this->validate($data) ||
            !isset($data["password"]) ||
            empty($data["password"])
        ) {
            $this->call(
                400,
                "bad_request",
                "Os campos name, email e password são obrigatórios",
                "error"
            )->back();
            return;
        }

        $checkUser = new User();

        if ($checkUser->emailExists($data["email"])) {
            $this->call(
                400,
                "bad_request",
                "E-mail já cadastrado",
                "error"
            )->back();
            return;
        }

        $typeId = 1;

        $user = new User(
            null,
            $typeId,
            $data["name"],
            $data["email"],
            $data["password"],
            $photo
        );

        if (!$user->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhotoUrl(),
            "active" => $user->getActive()
        ];

        $this->call(
            201,
            "success",
            "Usuário inserido com sucesso",
            "success"
        )->back($response);
    }

    public function update(array $data): void
    {
        $data = $this->mergeJsonBody($data);

        if (
            !isset($data["user_id"]) ||
            !filter_var($data["user_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Os campos name e email são obrigatórios",
                "error"
            )->back();
            return;
        }

        $user = new User();

        if (!$user->selectById($data["user_id"])) {
            $this->call(
                404,
                "not_found",
                "Usuário não encontrado",
                "error"
            )->back();
            return;
        }

        // Handle photo upload if provided
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $upload = new Upload();
            $photo = $upload->image($_FILES['photo'], 'users');
            if (!$photo) {
                $this->call(400, "bad_request", $upload->getError() ?? "Erro ao fazer upload da imagem", "error")->back(null);
                return;
            }
            // Delete old photo if exists
            if ($user->getPhoto()) {
                $oldPhotoPath = __DIR__ . '/../../../uploads/' . $user->getPhoto();
                if (file_exists($oldPhotoPath)) {
                    @unlink($oldPhotoPath);
                }
            }
            $user->setPhoto($photo);
        } elseif (isset($data["photo"])) {
            $user->setPhoto($data["photo"]);
        }

        $user->setName($data["name"]);
        $user->setEmail($data["email"]);

        if (isset($data["password"]) && !empty($data["password"])) {
            $user->setNewPassword($data["password"]);
        }

        if (isset($data["type_id"])) {
            $user->setTypeId($data["type_id"]);
        }

        if (!$user->updateById($data["user_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhotoUrl($user->getId(), $user->getTypeId()),
            "active" => $user->getActive()
        ];

        $this->call(
            200,
            "success",
            "Usuário atualizado com sucesso",
            "success"
        )->back($response);
    }

    public function delete(array $data): void
    {
        if (
            !isset($data["user_id"]) ||
            !filter_var($data["user_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        $user = new User();

        if (!$user->softDeleteById($data["user_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Usuário excluído com sucesso",
            "success"
        )->back();
    }

    public function auth(array $data): void
    {
        $data = $this->mergeJsonBody($data);

        if (
            !isset($data["email"]) ||
            !isset($data["password"]) ||
            empty($data["email"]) ||
            empty($data["password"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios",
                "error"
            )->back();
            return;
        }

        $user = new User();

        if (!$user->login($data["email"], $data["password"])) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhotoUrl($user->getId(), $user->getTypeId()),
            "token" => $user->getToken()
        ];

        $this->call(
            200,
            "success",
            "Login efetuado com sucesso",
            "success"
        )->back($response);
    }

    public function authAdmin(array $data): void
    {
        $data = $this->mergeJsonBody($data);

        if (
            !isset($data["email"]) ||
            !isset($data["password"]) ||
            empty($data["email"]) ||
            empty($data["password"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios",
                "error"
            )->back();
            return;
        }

        $user = new User();

        if (!$user->login($data["email"], $data["password"], 1)) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhotoUrl($user->getId(), $user->getTypeId()),
            "token" => $user->getToken()
        ];

        $this->call(
            200,
            "success",
            "Login de administrador efetuado com sucesso",
            "success"
        )->back($response);
    }

    public function validate(array $data): bool
    {
        if (
            !isset($data["name"]) ||
            !isset($data["email"]) ||
            empty($data["name"]) ||
            empty($data["email"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            return false;
        }

        return true;
    }

    /**
     * Upload user's profile photo.
     * Expects multipart/form-data with file field named "photo".
     * Requires JWT authentication (type_id = 1 for admins, 2 for regular users).
     */
    public function uploadPhoto(array $data): void
    {
        // Verify authentication (type_id = 1 for admins, 2 for regular users)
        if (!$this->authToken(1) && !$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Token inválido ou expirado",
                "error"
            )->back(null);
            return;
        }

        $userId = $this->userAuthId;

        // Check if file was uploaded
        if (!isset($_FILES['photo']) || !is_array($_FILES['photo'])) {
            $this->call(
                400,
                "bad_request",
                "Nenhuma foto foi enviada. Use o campo 'photo' no formulário multipart.",
                "error"
            )->back(null);
            return;
        }

        $file = $_FILES['photo'];

        // Check for upload errors
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $this->call(
                400,
                "bad_request",
                \Source\Support\Upload::uploadErrorMessage($file['error'] ?? UPLOAD_ERR_NO_FILE),
                "error"
            )->back(null);
            return;
        }

        try {
            // Process upload using Upload support class
            $photoPath = \Source\Support\Upload::image($file);

            // Update user's photo in database
            $user = new User();
            if (!$user->updatePhoto($userId, $photoPath)) {
                // If DB update fails, delete the uploaded file
                \Source\Support\Upload::delete($photoPath);
                $this->call(
                    500,
                    "server_error",
                    "Não foi possível atualizar a foto no banco de dados.",
                    "error"
                )->back(null);
                return;
            }

            // Return success with photo URL
            $photoUrl = url(ltrim($photoPath, "/"));
            $this->call(
                200,
                "success",
                "Foto de perfil atualizada com sucesso",
                "success"
            )->back([
                "photo" => $photoUrl,
                "photo_path" => $photoPath
            ]);
        } catch (\RuntimeException $e) {
            $this->call(
                400,
                "bad_request",
                $e->getMessage(),
                "error"
            )->back(null);
        } catch (\Exception $e) {
            error_log("Erro no upload de foto: " . $e->getMessage());
            $this->call(
                500,
                "server_error",
                "Erro interno do servidor ao processar upload.",
                "error"
            )->back(null);
        }
    }

    /**
     * Delete user's profile photo.
     * Requires JWT authentication (type_id = 1 for admins, 2 for regular users).
     */
    public function deletePhoto(array $data): void
    {
        // Verify authentication (type_id = 1 for admins, 2 for regular users)
        if (!$this->authToken(1) && !$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Token inválido ou expirado",
                "error"
            )->back(null);
            return;
        }

        $userId = $this->userAuthId;

        // Get current photo
        $user = new User();
        $currentPhoto = $user->getPhotoUrl($userId, $this->userAuthTypeId);

        if (!$currentPhoto) {
            $this->call(
                404,
                "not_found",
                "Usuário não possui foto de perfil",
                "error"
            )->back(null);
            return;
        }

        // Extract relative path from URL
        $photoPath = parse_url($currentPhoto, PHP_URL_PATH);
        if ($photoPath === false) {
            $this->call(
                500,
                "server_error",
                "Erro ao processar caminho da foto",
                "error"
            )->back(null);
            return;
        }

        $photoPath = ltrim($photoPath, "/");

        // Verify it's in uploads/users/
        if (!str_starts_with($photoPath, 'uploads/users/')) {
            $this->call(
                400,
                "bad_request",
                "Foto não gerenciada pelo sistema",
                "error"
            )->back(null);
            return;
        }

        // Delete file from filesystem
        \Source\Support\Upload::delete($photoPath);

        // Update database to remove photo
        if (!$user->updatePhoto($userId, "")) {
            $this->call(
                500,
                "server_error",
                "Não foi possível remover a foto do banco de dados.",
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Foto de perfil removida com sucesso",
            "success"
        )->back(null);
    }
}