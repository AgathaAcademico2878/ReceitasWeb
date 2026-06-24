<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;
use PDO;
use PDOException;

class MinhaPublicacao extends Model
{
    protected string $table = 'publicacoes';
    protected array $fillable = ['userId', 'categoryId', 'title', 'description', 'active'];

    private ?int $id = null;
    private ?int $userId = null;
    private ?int $categoryId = null;
    private ?string $title = null;
    private ?string $description = null;
    
    private ?string $createdAt = null;
    private ?string $comments = null;
    private ?string $likes = null;
    private ?int $active = null;

    public function __construct(?int $id = null, ?int $userId = null, ?int $categoryId = null, ?string $title = null, ?string $description = null, ?string $createdAt = null, ?string $comments = null, ?string $likes = null, ?int $active = null)
    {
        $this->id = $id;
        $this->userId = $userId;
        $this->categoryId = $categoryId;
        $this->title = $title;
        $this->description = $description;
        $this->createdAt = $createdAt;
        $this->comments = $comments;
        $this->likes = $likes;
        $this->active = $active;
    }


    public function getId(): ?int { return $this->id; }
    public function getUserId(): ?int { return $this->userId; }
    public function getCategoryId(): ?int { return $this->categoryId; }
    public function getTitle(): ?string { return $this->title; }
    public function getDescription(): ?string { return $this->description; }
    public function getCreatedAt(): ?string { return $this->createdAt; }
    public function getComments(): ?string { return $this->comments; }
    public function getLikes(): ?string { return $this->likes; }
    public function getActive(): ?int { return $this->active; }


    public function setId(?int $id): void { $this->id = $id; }
    public function setUserId(?int $userId): void { $this->userId = $userId; }
    public function setCategoryId(?int $categoryId): void { $this->categoryId = $categoryId; }
    public function setTitle(?string $title): void { $this->title = $title; }
    public function setDescription(?string $description): void { $this->description = $description; }
    public function setCreatedAt(?string $createdAt): void { $this->createdAt = $createdAt; }
    public function setComments(?string $comments): void { $this->comments = $comments; }
    public function setLikes(?string $likes): void { $this->likes = $likes; }
    public function setActive(?int $active): void { $this->active = $active; }

    public function selectByUserId(int $userId): array
    {
        $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function selectPaginatorByUserId(int $page, int $perPage, int $userId): array
    {
        $offset = ($page - 1) * $perPage;

        try {
            $conn = Connect::getInstance();

            $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE user_id = :user_id");
            $countStmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $countStmt->execute();
            $total = (int)$countStmt->fetch()['total'];

            $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            $stmt = $conn->prepare($query);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            return [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'data' => $stmt->fetchAll()
            ];
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }
}