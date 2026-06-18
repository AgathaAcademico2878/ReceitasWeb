<?php

namespace Source\Models;

use Source\Core\Model;

class Faq extends Model
{
    protected string $table = 'faqs';
    protected array $fillable = ['faqsCategoryId', 'question', 'answer', 'active'];

    private ?int $id = null;
    private ?int $faqsCategoryId = null;
    private ?string $question = null;
    private ?string $answer = null;
    private ?int $active = 1;

    public function __construct(?int $id = null, ?int $faqsCategoryId = null, ?string $question = null, ?string $answer = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->faqsCategoryId = $faqsCategoryId;
        $this->question = $question;
        $this->answer = $answer;
        $this->active = $active;
    }

    public function getId(): ?int { return $this->id; }
    public function getFaqsCategoryId(): ?int { return $this->faqsCategoryId; }
    public function getQuestion(): ?string { return $this->question; }
    public function getAnswer(): ?string { return $this->answer; }
    public function getActive(): ?int { return $this->active; }

    public function setId(?int $id): void { $this->id = $id; }
    public function setFaqsCategoryId(?int $faqsCategoryId): void { $this->faqsCategoryId = $faqsCategoryId; }
    public function setQuestion(?string $question): void { $this->question = $question; }
    public function setAnswer(?string $answer): void { $this->answer = $answer; }
    public function setActive(?int $active): void { $this->active = $active; }
}