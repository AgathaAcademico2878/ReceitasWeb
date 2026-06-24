<?php

namespace Source\Models;

use Source\Core\Model;

class Curtida extends Model
{
    protected string $table = 'curtidas';
    protected array $fillable = ['userId', 'publicacaoId'];

    private ?int $id = null;
    private ?int $userId = null;
    private ?int $publicacaoId = null;
    private ?string $createdAt = null;

    public function __construct(?int $id = null, ?int $userId = null, ?int $publicacaoId = null, ?string $createdAt = null)
    {
        $this->id = $id;
        $this->userId = $userId;
        $this->publicacaoId = $publicacaoId;
        $this->createdAt = $createdAt;
    }


    public function getId(): ?int { return $this->id; }
    public function getUserId(): ?int { return $this->userId; }
    public function getPublicacaoId(): ?int { return $this->publicacaoId; }
    public function getCreatedAt(): ?string { return $this->createdAt; }


    public function setId(?int $id): void { $this->id = $id; }
    public function setUserId(?int $userId): void { $this->userId = $userId; }
    public function setPublicacaoId(?int $publicacaoId): void { $this->publicacaoId = $publicacaoId; }
    public function setCreatedAt(?string $createdAt): void { $this->createdAt = $createdAt; }
}