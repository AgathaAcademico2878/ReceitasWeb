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

    /**
     * Update user's profile photo in database.
     * Allows update for active users with type_id = 1 (admins) or type_id = 2 (regular users).
     *
     * @param int    $id    User ID
     * @param string $photo Relative path to photo (e.g., "uploads/users/abc123.jpg")
     * @return bool True on success
     */
    public function updatePhoto(int $id, string $photo): bool
    {
        $query = "UPDATE {$this->table} SET photo = :photo WHERE id = :id AND type_id IN (1, 2) AND active = 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":photo", $photo);
            $stmt->bindValue(":id", $id, \PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            error_log("Erro ao atualizar foto do usuário: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user's photo URL (full URL or null if no photo).
     *
     * @param int|null $id User ID (optional, uses current object's ID if not provided)
     * @param int|null $typeId Optional type_id filter (defaults to current user's typeId if loaded)
     * @return string|null Full URL to photo or null
     */
    public function getPhotoUrl(?int $id = null, ?int $typeId = null): ?string
    {
        $id = $id ?? $this->id;
        if (!$id) {
            return null;
        }
        // Use provided typeId or fall back to current object's typeId
        $typeId = $typeId ?? $this->typeId ?? 2;

        $query = "SELECT photo FROM {$this->table} WHERE id = :id AND type_id = :type_id AND active = 1 LIMIT 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, \PDO::PARAM_INT);
            $stmt->bindValue(":type_id", $typeId, \PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch();

            if ($result && !empty($result->photo)) {
                $photoPath = $result->photo;
                // If already a full URL, return as-is
                if (filter_var($photoPath, FILTER_VALIDATE_URL)) {
                    return $photoPath;
                }
                // Otherwise build full URL
                return url(ltrim($photoPath, "/"));
            }

            return null;
        } catch (\PDOException $e) {
            error_log("Erro ao buscar foto do usuário: " . $e->getMessage());
            return null;
        }
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