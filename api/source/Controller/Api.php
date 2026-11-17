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

    /**
     * Parse JSON body and merge into $data for PUT/PATCH/DELETE requests
     */
    protected function mergeJsonBody(array $data): array
    {
        $raw = $_SERVER['RAW_HTTP_BODY'] ?? file_get_contents('php://input');
        if (!empty($raw)) {
            $json = json_decode($raw, true);
            if (is_array($json)) {
                $data = array_merge($data, $json);
            }
        }
        return $data;
    }


    public function authToken(int $typeId): bool
    {
        $header = getallheaders();

        $token = $header["token"] ?? $header['Authorization'] ?? $header['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        if (!$token) {
            return false;
        }

        if (str_starts_with($token, 'Bearer ')) {
            $token = substr($token, 7);
        }

        $jwt = new JWTToken();
        $jwtToken = $jwt->decode($token);

        if (!$jwtToken) {
            file_put_contents('C:/wamp64/www/ReceitasWeb/auth_debug.log', date('Y-m-d H:i:s') . " JWT decode FALHOU para token: " . substr($token, 0, 50) . "...\n", FILE_APPEND);
            return false;
        }

        file_put_contents('C:/wamp64/www/ReceitasWeb/auth_debug.log', date('Y-m-d H:i:s') . " JWT decode OK email=" . ($jwtToken->data->email ?? 'NULL') . " typeId=$typeId\n", FILE_APPEND);

        $user = new User();
        $permOk = $user->permissionVerify($jwtToken->data->email, $typeId);
        file_put_contents('C:/wamp64/www/ReceitasWeb/auth_debug.log', date('Y-m-d H:i:s') . " permissionVerify result: " . ($permOk ? 'true' : 'false') . "\n", FILE_APPEND);
        if (!$permOk) {
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