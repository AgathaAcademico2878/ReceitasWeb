<?php

namespace Source\Models;

use Source\Core\Model;

class Publicacao extends Model
{
    protected string $table = 'publicacoes';

    private ?int $id = null;
    private ?int $userId = null;
    private ?int $categoryId = null;
    private ?string $title = null;
    private ?string $description = null;
    private ?string $createdAt = null;
    private ?string $comments = null;
    private ?string $likes = null;
    private ?int $active = 1;

    public function __construct(?int $id = null, ?int $userId = null, ?int $categoryId = null, ?string $title = null, ?string $description = null, ?string $createdAt = null, ?string $comments = null, ?string $likes = null, ?int $active = 1)
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

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getUserId(): ?int { return $this->userId; }
    public function getCategoryId(): ?int { return $this->categoryId; }
    public function getTitle(): ?string { return $this->title; }
    public function getDescription(): ?string { return $this->description; }
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
    public function setCreatedAt(?string $createdAt): void { $this->createdAt = $createdAt; }
    public function setComments(?string $comments): void { $this->comments = $comments; }
    public function setLikes(?string $likes): void { $this->likes = $likes; }
    public function setActive(?int $active): void { $this->active = $active; }
}