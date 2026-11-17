import HttpClientBase from "./HttpClientBase.js";

export default class Users extends HttpClientBase {

    #id;
    #type_id;
    #name;
    #email;
    #password;
    #photo;
    #active;

    constructor({ id = null, type_id = null, name = "", email = "", password = "", photo = null, active = 1 } = {}) {
        this.id = id;
        this.type_id = type_id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.photo = photo;
        this.active = active;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get type_id() {
        return this.#type_id;
    }

    set type_id(value) {
        this.#type_id = value === null ? null : Number(value);
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome é obrigatório");
        }
        this.#name = value.trim();
    }

    get email() {
        return this.#email;
    }

    set email(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O email é obrigatório");
        }
        this.#email = value.trim();
    }

    get password() {
        return this.#password;
    }

    set password(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A senha é obrigatória");
        }
        this.#password = value.trim();
    }

    get photo() {
        return this.#photo;
    }

    set photo(value) {
        this.#photo = value;
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = value === null ? null : Number(value);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    async login(email, password) {
        return this.postForm("/users/login", { email, password });
    }

    async loginFromForm(form) {
        return this.postForm("/users/login", form);
    }

    async loginAdmin(email, password) {
        return this.postForm("/users/login-admin", { email, password });
    }

    async loginAdminFromForm(form) {
        return this.postForm("/users/login-admin", form);
    }

    async loginAthlete(email, password) {
        return this.postForm("/users/login-athlete", { email, password });
    }

    async loginAthleteFromForm(form) {
        return this.postForm("/users/login-athlete", form);
    }

    async register(data) {
        return this.postForm("/users/register", data);
    }

    async update(data) {
        return this.put("/users/update", data);
    }

    async updateAdmin(data) {
        return this.put("/users/update-admin", data);
    }
}