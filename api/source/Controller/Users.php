<?php

namespace Source\Controller;

use Source\Models\User;

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
            "photo" => $user->getPhoto(),
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

        $typeId = (
            isset($data["type_id"]) &&
            $data["type_id"] == 1
        ) ? 1 : 2;

        $user = new User(
            null,
            $typeId,
            $data["name"],
            $data["email"],
            $data["password"]
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

        $user->setName($data["name"]);
        $user->setEmail($data["email"]);

        if (isset($data["password"]) && !empty($data["password"])) {
            $user->setNewPassword($data["password"]);
        }

        if (isset($data["photo"])) {
            $user->setPhoto($data["photo"]);
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
            "photo" => $user->getPhoto(),
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
            "name" => $user->getName(),
            "email" => $user->getEmail(),
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
            "name" => $user->getName(),
            "email" => $user->getEmail(),
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
}