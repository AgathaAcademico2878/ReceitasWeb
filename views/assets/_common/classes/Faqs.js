import HttpClientBase from "./HttpClientBase.js";

export default class Faqs extends HttpClientBase {
    #id;
    #pergunta;
    #resposta;

    constructor({ id = null, pergunta = "", resposta = "" } = {}) { 
        this.id = id;
        this.pergunta = pergunta;
        this.resposta = resposta;
    }

    get id() {
        return this.#id;
    }   
    set id(value) {
        this.#id = value === null ? null : Number(value);
    }
    get pergunta() {
        return this.#pergunta;
    }   
    set pergunta(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A pergunta é obrigatória");
        }   
        this.#pergunta = value.trim();
    }
    get resposta() {
        return this.#resposta;
    }
    set resposta(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A resposta é obrigatória");
        }
        this.#resposta = value.trim();
    }
    ////////////////////////////////////////////////////////////////////////
    async listAll() {
        return this.get("/faqs");
    }

    async listAllAdmin() {
        return this.get("/faqs/admin/list");
    }

    async listById(id) {
        return this.get("/faqs/:id", { id });
    }

    async insert(data) {
        return this.postForm("/faqs", data);
    }

    async update(id, data) {
        return this.putForm("/faqs/:id", data, { id });
    }

    async remove(id) {
        return this.delete("/faqs/:id", { id });
    }
}