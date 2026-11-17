import HttpClientBase from "./HttpClientBase.js";

export default class Publicacoes extends HttpClientBase {
    
    #id;
    #user_id;
    #category_id;
    #title;
    #description;
    #created_at;
    #comments;
    #likes;
    #active;


    constructor({ id = null, user_id = null, category_id = null, title = "", description = "", created_at = null, comments = null, likes = null, active = 1 } = {}) {
        this.id = id;
        this.user_id = user_id;
        this.category_id = category_id;
        this.title = title;
        this.description = description;
        this.created_at = created_at;
        this.comments = comments;
        this.likes = likes;
        this.active = active;
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

    get category_id() {
        return this.#category_id;
    }

    set category_id(value) {
        this.#category_id = value === null ? null : Number(value);
    }

    get title() {
        return this.#title;
    }

    set title(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O título é obrigatório");
        }
        this.#title = value.trim();
    }

    get description() {
        return this.#description;
    }  
    set description(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A descrição é obrigatória");
        }
        this.#description = value.trim();
    }
    get created_at() {
        return this.#created_at;
    }   
    set created_at(value) {
        this.#created_at = value === null ? null : new Date(value);
    }  
    get comments() {
        return this.#comments;
    }
    set comments(value) {
        this.#comments = value === null ? null : Number(value);
    }   
    get likes() {
        return this.#likes;
    }
    set likes(value) {
        this.#likes = value === null ? null : Number(value);
    }
    get active() {
        return this.#active;
    }  
    set active(value) {
        this.#active = value === null ? null : Number(value);
    }


    toJSON() {
        return { id: this.id, user_id: this.user_id, category_id: this.category_id, title: this.title, description: this.description, created_at: this.created_at, comments: this.comments, likes: this.likes, active: this.active };
    }

    async listAll() {
        return this.get("/publicacoes/list");
    }

    async listById(id) {
        return this.get("/publicacoes/list/:publicacao_id", { publicacao_id: id });
    }

    async listPaginator(page = 1, perPage = 10) {
        return this.get("/publicacoes/list/paginator/:page/:per_page", {
            page,
            per_page: perPage
        });
    }

    async insert(data) {
        return this.post("/publicacoes/", data);
    }

    async update(id, data) {
        return this.put("/publicacoes/:publicacao_id", data, {
            publicacao_id: id
        });
    }

    async remove(id) {
        return this.delete("/publicacoes/:publicacao_id", {
            publicacao_id: id
        });
    }
}