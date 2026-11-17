import HttpClientBase from "./HttpClientBase.js";

export default class Comentarios extends HttpClientBase {
    #id;
    #user_id;
    #publicacao_id;
    #comentario;
    #created_at;

    constructor({ id = null, user_id = null, publicacao_id = null, comentario = "", created_at = null } = {}) {
        this.id = id;
        this.user_id = user_id;
        this.publicacao_id = publicacao_id;
        this.comentario = comentario;
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

    get comentario() {
        return this.#comentario;
    }

    set comentario(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O comentário é obrigatório");
        }
        this.#comentario = value.trim();
    }

    get created_at() {
        return this.#created_at;
    }

    set created_at(value) {
        this.#created_at = value;
    }
//////////////////////////////////////////////////////////////////////////
    async listAll() {
        return this.get("/comentarios/list");
    }

    async listById(id) {
        return this.get("/comentarios/list/:comentario_id", { comentario_id: id });
    }

    async listPaginator(page = 1, perPage = 10) {
        return this.get("/comentarios/list/paginator/:page/:per_page", {
            page,
            per_page: perPage
        });
    }

    async insert(data) {
        return this.post("/comentarios/", data);
    }

    async update(id, data) {
        return this.put("/comentarios/:comentario_id", data, {
            comentario_id: id
        });
    }

    async remove(id) {
        return this.delete("/comentarios/:comentario_id", {
            comentario_id: id
        });
    }
}