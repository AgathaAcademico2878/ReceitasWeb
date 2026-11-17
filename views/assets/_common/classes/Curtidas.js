import HttpClientBase from "./HttpClientBase.js";

export default class Curtidas extends HttpClientBase {

    #id;
    #usuarioId;
    #receitaId;

    constructor({ id = null, usuarioId = null, receitaId = null } = {}) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.receitaId = receitaId;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get usuarioId() {
        return this.#usuarioId;
    }

    set usuarioId(value) {
        this.#usuarioId = value === null ? null : Number(value);
    }

    get receitaId() {
        return this.#receitaId;
    }

    set receitaId(value) {
        this.#receitaId = value === null ? null : Number(value);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    async listAll() {
        return this.get("/curtidas/list");
    }

    async listById(id) {
        return this.get("/curtidas/list/:curtida_id", { curtida_id: id });
    }

    async listPaginator(page = 1, perPage = 10) {
        return this.get("/curtidas/list/paginator/:page/:per_page", {
            page,
            per_page: perPage
        });
    }

    async insert(data) {
        return this.post("/curtidas/", data);
    }

    async update(id, data) {
        return this.put("/curtidas/:curtida_id", data, {
            curtida_id: id
        });
    }

    async remove(id) {
        return this.delete("/curtidas/:curtida_id", {
            curtida_id: id
        });
    }
}