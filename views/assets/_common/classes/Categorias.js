import HttpClientBase from "./HttpClientBase.js";

export default class Categorias extends HttpClientBase {
   
   #id;
   #nome;

   constructor({ id = null, nome = "" } = {}) {
       this.id = id;
       this.nome = nome;
   }

   get id() {
       return this.#id;
   }

   set id(value) {
       this.#id = value === null ? null : Number(value);
   }

   get nome() {
       return this.#nome;
   }

   set nome(value) {
       if (typeof value !== "string" || value.trim() === "") {
           throw new TypeError("O nome da categoria é obrigatório");
       }
       this.#nome = value.trim();
   }

    async listAll() {
        return this.get("/categorias/list");
    }

    async listById(id) {
        return this.get("/categorias/list/:categoria_id", { categoria_id: id });
    }

    async listPaginator(page = 1, perPage = 10) {
        return this.get("/categorias/list/paginator/:page/:per_page", {
            page,
            per_page: perPage
        });
    }

    async insert(data) {
        return this.post("/categorias/", data);
    }

    async update(id, data) {
        return this.put("/categorias/:categoria_id", data, {
            categoria_id: id
        });
    }

    async remove(id) {
        return this.delete("/categorias/:categoria_id", {
            categoria_id: id
        });
    }
}