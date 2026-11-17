import HttpClientBase from "./HttpClientBase.js";

export default class PublicacoesSalvas extends HttpClientBase {
    #id;
    #user_id;
    #publicacao_id;
    #tipo;
    #created_at;

    constructor({ id = null, user_id = null, publicacao_id = null, tipo = "", created_at = null } = {}) {
        this.id = id;
        this.user_id = user_id;
        this.publicacao_id = publicacao_id;
        this.tipo = tipo;
        this.created_at = created_at;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get user_id() {
        return this.#user_id;
    }

    set user_id(value) {
        this.#user_id = value === null ? null : Number(value);
    }

    get publicacao_id() {
        return this.#publicacao_id;
    }

    set publicacao_id(value) {
        this.#publicacao_id = value === null ? null : Number(value);
    }

    get tipo() {
        return this.#tipo;
    }

    set tipo(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O tipo é obrigatório");
        }
        this.#tipo = value.trim();
    }

    get created_at() {
        return this.#created_at;
    }

    set created_at(value) {
        this.#created_at = value === null ? null : new Date(value);
    }

    toJSON() {
        return { id: this.id, user_id: this.user_id, publicacao_id: this.publicacao_id, tipo: this.tipo, created_at: this.created_at };
    }

    
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    async listAll() {
        return this.get("/publicacoes-salvas/list");
    }

    async listById(id) {
        return this.get("/publicacoes-salvas/list/:publicacao_id", { publicacao_id: id });
    }

    async listPaginator(page = 1, perPage = 10) {
        return this.get("/publicacoes-salvas/list/paginator/:page/:per_page", {
            page,
            per_page: perPage
        });
    }

    async insert(data) {
        return this.post("/publicacoes-salvas/", data);
    }

    async update(id, data) {
        return this.put("/publicacoes-salvas/:publicacao_id", data, {
            publicacao_id: id
        });
    }

    async remove(id) {
        return this.delete("/publicacoes-salvas/:publicacao_id", {
            publicacao_id: id
        });
    }
}