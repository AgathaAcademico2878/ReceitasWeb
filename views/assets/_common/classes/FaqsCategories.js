import HttpClientBase from "./HttpClientBase.js";

export default class FaqCategories extends HttpClientBase {

    #id;
    #name;

    constructor({ id = null, name = "" } = {}) {
        this.id = id;
        this.name = name;
    }   

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }   
    set id(value) {
        this.#id = value === null ? null : Number(value);
    }
    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome é obrigatório");
        }
        this.#name = value.trim();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    async listAll() {
        return this.get("/faqs-categories");
    }

    async listById(id) {
        return this.get("/faqs-categories/:id", { id });
    }

    async insert(name) {
        return this.postForm("/faqs-categories", { name });
    }
        async insert(active) {
        return this.postForm("/faqs-categories", { active });
    }

    async update(id, data, active) {
        return this.putForm("/faqs-categories/:id", data, { id }, active);
    }

    async remove(id) {
        return this.delete("/faqs-categories/:id", { id });
    }
}