<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;

class Publicacao extends Model
{
    protected string $table = 'publicacoes';
    protected string $primaryKey = 'id';
    protected array $fillable = ['userId', 'categoryId', 'title', 'description', 'photo', 'active'];

    private ?int $id = null;
    private ?int $userId = null;
    private ?int $categoryId = null;
    private ?string $title = null;
    private ?string $description = null;
    private ?string $photo = null;
    private ?string $createdAt = null;
    private ?string $comments = null;
    private ?string $likes = null;
    private ?int $active = 1;

    public function __construct(?int $id = null, ?int $userId = null, ?int $categoryId = null, ?string $title = null, ?string $description = null, ?string $photo = null, ?string $createdAt = null, ?string $comments = null, ?string $likes = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->userId = $userId;
        $this->categoryId = $categoryId;
        $this->title = $title;
        $this->description = $description;
        $this->photo = $photo;
        $this->createdAt = $createdAt;
        $this->comments = $comments;
        $this->likes = $likes;
        $this->active = $active;
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getUserId(): ?int { return $this->userId; }
    public function getCategoryId(): ?int { return $this->categoryId; }
    public function getTitle(): ?string { return $this->title; }
    public function getDescription(): ?string { return $this->description; }
    public function getPhoto(): ?string { return $this->photo; }
    public function getCreatedAt(): ?string { return $this->createdAt; }
    public function getComments(): ?string { return $this->comments; }
    public function getLikes(): ?string { return $this->likes; }
    public function getActive(): ?int { return $this->active; }

    // Setters
    public function setId(?int $id): void { $this->id = $id; }
    public function setUserId(?int $userId): void { $this->userId = $userId; }
    public function setCategoryId(?int $categoryId): void { $this->categoryId = $categoryId; }
    public function setTitle(?string $title): void { $this->title = $title; }
    public function setDescription(?string $description): void { $this->description = $description; }
    public function setPhoto(?string $photo): void { $this->photo = $photo; }
    public function setCreatedAt(?string $createdAt): void { $this->createdAt = $createdAt; }
    public function setComments(?string $comments): void { $this->comments = $comments; }
    public function setLikes(?string $likes): void { $this->likes = $likes; }
    public function setActive(?int $active): void { $this->active = $active; }

    /**
     * Get full URL for publication photo
     */
    public function getPhotoUrl(): ?string
    {
        if (empty($this->photo)) {
            return null;
        }
        // If already a full URL, return as-is
        if (filter_var($this->photo, FILTER_VALIDATE_URL)) {
            return $this->photo;
        }
        // Otherwise build full URL
        return url(ltrim($this->photo, "/"));
    }

    /**
     * Select publication by ID with author info (JOIN users table)
     */
    public function selectByIdWithAuthor(int $id): ?array
    {
        try {
            $query = "
                SELECT p.*, u.name as author_name, u.email as author_email, u.photo as author_photo, p.photo
                FROM {$this->table} p
                INNER JOIN users u ON p.user_id = u.id
                WHERE p.{$this->primaryKey} = :id
            ";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':id', $id);
            $stmt->execute();
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return null;
        }
    }

    /**
     * Select all publications with author info (JOIN users table)
     */
    public function selectAllWithAuthor(array $filters = [], ?string $orderBy = 'p.id', string $direction = 'ASC'): array
    {
        try {
            $query = "
                SELECT p.*, u.name as author_name, u.email as author_email, u.photo as author_photo, p.photo
                FROM {$this->table} p
                INNER JOIN users u ON p.user_id = u.id
            ";
            if (!empty($filters)) {
                $query .= " WHERE ";
                foreach ($filters as $index => $filter) {
                    $query .= $filter;
                    if ($index < count($filters) - 1) {
                        $query .= " AND ";
                    }
                }
            }
            if ($orderBy) {
                $query .= " ORDER BY {$orderBy} {$direction}";
            }
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    /**
     * Select paginated publications with author info (JOIN users table)
     */
    public function selectPaginatorWithAuthor(int $page = 1, int $perPage = 10, array $filters = [], ?string $orderBy = 'p.id', string $direction = 'ASC'): array
    {
        try {
            $query = "
                SELECT p.*, u.name as author_name, u.email as author_email, u.photo as author_photo, p.photo
                FROM {$this->table} p
                INNER JOIN users u ON p.user_id = u.id
            ";
            $queryCount = "SELECT COUNT(*) as 'count' FROM {$this->table} p";

            if (!empty($filters)) {
                $query .= " WHERE ";
                $queryCount .= " WHERE ";
                foreach ($filters as $index => $filter) {
                    $query .= $filter;
                    $queryCount .= $filter;
                    if ($index < count($filters) - 1) {
                        $query .= " AND ";
                        $queryCount .= " AND ";
                    }
                }
            }

            $stmtCount = Connect::getInstance()->query($queryCount);
            $total = $stmtCount->fetch()->count;

            if ($orderBy) {
                $query .= " ORDER BY {$orderBy} {$direction}";
            }

            $offset = ($page - 1) * $perPage;
            $query .= " LIMIT {$perPage} OFFSET {$offset}";

            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll();

            return [
                'data' => $data,
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => (int) ceil($total / $perPage)
            ];
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [
                'data' => [],
                'total' => 0,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => 0
            ];
        }
    }
}