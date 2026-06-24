<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;
use Source\Core\JWTToken;
use PDO;

class User extends Model
{
    private ?int $id;
    private ?int $typeId;
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?string $photo;
    private ?int $active;
    private ?string $token;

    public function __construct(
        ?int $id = null,
        ?int $typeId = null,
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
        ?string $photo = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->typeId = $typeId;
        $this->name = $name;
        $this->email = $email;
        $this->photo = $photo;
        $this->active = $active;
        $this->token = null;

        $this->password = null;

        if ($password !== null) {
            $this->setNewPassword($password);
        }

        $this->table = "users";
        $this->primaryKey = "id";
        $this->fillable = [
            "typeId",
            "name",
            "email",
            "password",
            "photo",
            "active"
        ];
    }

    public function login(string $email, string $password, ?int $typeId = null): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email";

        if ($typeId !== null) {
            $query .= " AND type_id = :type_id";
        }

        try {

            $stmt = Connect::getInstance()->prepare($query);

            $stmt->bindValue(":email", $email);

            if ($typeId !== null) {
                $stmt->bindValue(":type_id", $typeId, PDO::PARAM_INT);
            }

            $stmt->execute();

            $result = $stmt->fetch();

            if (!$result) {
                $this->errorMessage = "Credenciais inválidas.";
                return false;
            }

            if (!password_verify($password, $result->password)) {
                $this->errorMessage = "Credenciais inválidas.";
                return false;
            }

            if (!$result->active) {
                $this->errorMessage = "Usuário desativado.";
                return false;
            }

            $this->id = $result->id;
            $this->typeId = $result->type_id;
            $this->name = $result->name;
            $this->email = $result->email;
            $this->password = $result->password;
            $this->photo = $result->photo;
            $this->active = $result->active;

            $jwt = new JWTToken();

            $this->token = $jwt->encode([
                "id" => $this->id,
                "email" => $this->email
            ]);

            return true;

        } catch (\PDOException $e) {

            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    public function permissionVerify(string $email, int $typeId): bool
    {
        $query = "SELECT id
                  FROM {$this->table}
                  WHERE email = :email
                  AND type_id = :type_id
                  AND active = 1";

        try {

            $stmt = Connect::getInstance()->prepare($query);

            $stmt->bindValue(":email", $email);
            $stmt->bindValue(":type_id", $typeId);

            $stmt->execute();

            return (bool)$stmt->fetch();

        } catch (\PDOException $e) {

            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    public function emailExists(string $email): bool
    {
        $query = "SELECT id
                  FROM {$this->table}
                  WHERE email = :email
                  LIMIT 1";

        try {

            $stmt = Connect::getInstance()->prepare($query);

            $stmt->bindValue(":email", $email);

            $stmt->execute();

            return (bool)$stmt->fetch();

        } catch (\PDOException $e) {

            $this->errorMessage = $e->getMessage();
            return true;
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getTypeId(): ?int
    {
        return $this->typeId;
    }

    public function setTypeId(int $typeId): void
    {
        $this->typeId = $typeId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function setNewPassword(string $password): void
    {
        $this->password = password_hash($password, PASSWORD_DEFAULT);
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): void
    {
        $this->photo = $photo;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(?string $token): void
    {
        $this->token = $token;
    }
}