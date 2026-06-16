<?php

namespace Source\Controller;

use Source\Models\Receita;

class Receitas extends \Source\Controller\Api
{
    private $receita;

    public function __construct()
    {
        $this->receita = new Receita();
    }

    public function listar($dados)
    {
        $receitas = $this->receita->find();
        if ($receitas) {
            $this->call(200, 'success', 'Receitas encontradas');
            $this->back($receitas);
        } else {
            $this->call(404, 'error', 'Nenhuma receita encontrada');
            $this->back(null);
        }
    }

    public function buscar($dados)
    {
        $id = $dados['id'] ?? null;
        if (!$id) {
            $this->call(400, 'error', 'ID da receita não informado');
            $this->back(null);
            return;
        }

        $receita = $this->receita->find($id);
        if ($receita) {
            $this->call(200, 'success', 'Receita encontrada');
            $this->back($receita);
        } else {
            $this->call(404, 'error', 'Receita não encontrada');
            $this->back(null);
        }
    }

    public function cadastrar()
    {
        // Get JSON data from request body
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // If that fails, try $_POST
        if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
            $data = $_POST;
        }

        // Debug: return what we received
        $response = [
            'input' => $input,
            'data' => $data,
            'json_last_error' => json_last_error(),
            '_POST' => $_POST
        ];

        $this->call(200, 'debug', 'Debug info');
        $this->back($response);
    }

    public function atualizar($dados)
    {
        $id = $dados['id'] ?? null;
        if (!$id) {
            $this->call(400, 'error', 'ID da receita não informado');
            $this->back(null);
            return;
        }

        // Mapear os dados para corresponder aos nomes dos campos da tabela
        $data = [];
        if (isset($dados['title'])) {
            $data['title'] = $dados['title'];
        }
        if (isset($dados['description'])) {
            $data['description'] = $dados['description'];
        }
        if (isset($dados['user_id'])) {
            $data['user_id'] = $dados['user_id'];
        }
        if (isset($dados['category_id'])) {
            $data['category_id'] = $dados['category_id'];
        }

        if (empty($data)) {
            $this->call(400, 'error', 'Nenhum campo para atualizar foi fornecido');
            $this->back(null);
            return;
        }

        $result = $this->receita->update($id, $data);
        if ($result) {
            $this->call(200, 'success', 'Receita atualizada com sucesso');
            $this->back(null);
        } else {
            $this->call(500, 'error', 'Erro ao atualizar receita');
            $this->back(null);
        }
    }

    public function excluir($dados)
    {
        $id = $dados['id'] ?? null;
        if (!$id) {
            $this->call(400, 'error', 'ID da receita não informado');
            $this->back(null);
            return;
        }

        $result = $this->receita->delete($id);
        if ($result) {
            $this->call(200, 'success', 'Receita excluída com sucesso');
            $this->back(null);
        } else {
            $this->call(500, 'error', 'Erro ao excluir receita');
            $this->back(null);
        }
    }
}