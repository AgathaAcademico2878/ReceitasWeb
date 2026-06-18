<?php

namespace Source\Models;

use Source\Core\Model;

class Categoria extends Model
{
    protected string $table = 'categorias';
    protected array $fillable = ['name', 'active'];

    private ?int $id = null;
    private ?string $name = null;
    private ?int $active = null;

    public function __construct(?int $id = null, ?string $name = null, ?int $active = null)
    {
        $this->id = $id;
        $this->name = $name;
        $this->active = $active;
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getName(): ?string { return $this->name; }
    public function getActive(): ?int { return $this->active; }

    // Setters
    public function setId(?int $id): void { $this->id = $id; }
    public function setName(?string $name): void { $this->name = $name; }
    public function setActive(?int $active): void { $this->active = $active; }
}