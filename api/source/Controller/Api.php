<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Core\JWTToken;

class Api
{
    protected int $userAuthId = 0;
    protected array $response = [];

    public function hello()
    {
        echo "Olá, mundo! Estamos com a API funcionando, graças a Deus!";
    }


    public function authToken(int $typeId): bool
    {
        $header = getallheaders();

        $token = $header["token"] ?? $header['Authorization'] ?? $header['authorization'] ?? null;

        if (!$token) {
            return false;
        }

        if (str_starts_with($token, 'Bearer ')) {
            $token = substr($token, 7);
        }

        $jwt = new JWTToken();
        $jwtToken = $jwt->decode($token);

        if (!$jwtToken) {
            return false;
        }

        $user = new User();
        if (!$user->permissionVerify($jwtToken->data->email, $typeId)) {
            return false;
        }

        $this->userAuthId = $jwtToken->data->id;

        return true;
    }

    protected function call(int $code, ?string $status = null, ?string $message = null, ?string $type = null): self
    {
        http_response_code($code);
        if (!empty($status)) {
            $this->response = [
                "code" => $code,
                "type" => $type,
                "status" => $status,
                "message" => (!empty($message) ? $message : null)
            ];
        }
        return $this;
    }

    protected function back(object | array | null $data = null): self
    {
        header('Content-Type: application/json');
        if ($data !== null) {
            $this->response["data"] = $data;
        }
        echo json_encode($this->response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $this;
    }
}