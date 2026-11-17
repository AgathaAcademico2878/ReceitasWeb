import HttpClientBase from "./HttpClientBase.js";

export default class MinhasPublicacoes extends HttpClientBase {
    #id;
    #user_id;
    #publicacao_id;

    constructor({ id = null, user_id = null, publicacao_id = null } = {}) {
        this.id = id;
        this.user_id = user_id;
        this.publicacao_id = publicacao_id;
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

    async listAll() {
        return this.get("/minhas-publicacoes/list");
    }

    async listById(id) {
        return this.get("/minhas-publicacoes/list/:minhas_publicacoes_id", { minhas_publicacoes_id: id });
    }

    async listPaginator(page = 1, perPage = 10) {
        return this.get("/minhas-publicacoes/list/paginator/:page/:per_page", {
            page,
            per_page: perPage
        });
    }

    async insert(data) {
        return this.post("/minhas-publicacoes/", data);
    }

    async update(id, data) {
        return this.put("/minhas-publicacoes/:minhas_publicacoes_id", data, {
            minhas_publicacoes_id: id
        });
    }

    async remove(id) {
        return this.delete("/minhas-publicacoes/:minhas_publicacoes_id", {
            minhas_publicacoes_id: id
        });
    }
}