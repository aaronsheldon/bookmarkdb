// Default class
module.exports = class BookmarkDB extends Function {

    // Build the database from JSON
    constructor(document) {
        const MirrorMap = require("@aaronsheldon/mirrormap");

        // Privately persist data
        const bookmarks = new MirrorMap();
        const base = super();

        // Safely update document nodes.
        const BookmarkDB = (command) => {
            if (command instanceof COMMAND) {
                return command({ bookmarks: bookmarks });
            }
        };

        // Override property accessors to forward to the bookmarks
        const handlers = {
            defineProperty(t, k, d) { return false; },
            getOwnPropertyDescriptor(t, k) { return undefined; },
            getPrototypeOf(t) { return base; },
            setPrototypeOf(t, p) { return false; },
            has(t, k) { return bookmarks.has(k); },
            ownKeys(t) { return bookmarks.keys(); },

            // Empty string is document
            get(t, k, r) {
                if (k === "") { return document; }
                const vs = bookmarks.get(k);
                return vs.size === 1 ? vs.values().next().value : vs;
            },

            // Add to the map
            set(t, k, v, r) {
                if (k === "") { return false; }
                if (v instanceof Set) {
                    v.forEach(
                        (e) => {
                            if (!(e instanceof Object)) { return; }
                            bookmarks.set(k, e);
                        }
                    );
                    return true;
                }
                if (v instanceof Object) { return bookmarks.set(k, v); };
                return false;
            },

            // Remove from the map
            deleteProperty(t, k) {
                if (k === "") { return bookmarks.clear(); }
                return bookmarks.delete(k);
            }
        };

        // Send;
        return new Proxy(BookmarkDB, handlers);
    }

    // Create or replace vertex private
    static #ASSIGNVERTEX({ bookmarks, parent, edge, child, label } = {}) {
        if (child === undefined) { return false; }
        const query = { bookmarks: bookmarks, vertex: parent[edge] };
        if (Array.isArray(parent) && edge === undefined) { parent.push(child); }
        else { parent[edge] = child; }
        if (child instanceof Object && typeof label === "string" && label !== "") { bookmarks.set(child, label); }
        return BookmarkDB.#CLEARLABELS(query);
    }

    // Delete vertex private
    static #REMOVEVERTEX({ bookmarks, parent, edge } = {}) {
        const query = { bookmarks: bookmarks, vertex: parent[edge] };
        if (Array.isArray(parent) && Number.isInteger(edge)) { parent.splice(edge, 1); }
        else { delete parent[edge]; }
        return BookmarkDB.#CLEARLABELS(query);
    }

    // Get labels private
    static #GETLABELS({ bookmarks, vertex } = {}) {
        if (!(vertex instanceof Object)) { return false; }
        const ls = bookmarks.get(vertex);
        return ls.size === 1 ? ls.values().next().value : ls;
    }

    // Get all bookmarks private
    static #GETBOOKMARKS({ bookmarks } = {}) {
        return bookmarks;
    }

    // Remove vertex label private
    static #UNDOLABEL({ bookmarks, vertex, label } = {}) {
        if (!(vertex instanceof Object)) { return false; }
        if (typeof label !== "string") { return false; }
        if (label === "") { return false; }
        return bookmarks.undo(vertex, label);
    }

    // Remove vertex labels private
    static #UNDOLABELS({ bookmarks, vertex } = {}) {
        if (!(vertex instanceof Object)) { return false; }
        return bookmarks.delete(vertex);
    }

    // Clear labels recursively private
    static #CLEARLABELS({ bookmarks, vertex } = {}) {
        if (!(vertex instanceof Object)) { return false; }
        (Array.isArray(vertex) ? vertex : Object.values(vertex)).forEach(
            (v) => { BookmarkDB.#CLEARLABELS({ bookmarks: bookmarks, vertex: v }); }
        );
        return bookmarks.delete(vertex);
    }

    // Clear all labels private
    static #CLEARALL({ bookmarks } = {}) {
        return bookmarks.clear();
    }

    // Create or replace vertex closure wrapper
    static ASSIGNVERTEX(query = {}) {
        const ASSIGNVERTEX = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#ASSIGNVERTEX(query);
        };
        return new COMMAND(ASSIGNVERTEX);
    }

    // Delete vertex closure wrapper
    static REMOVEVERTEX(query = {}) {
        const REMOVEVERTEX = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#REMOVEVERTEX(query);
        };
        return new COMMAND(REMOVEVERTEX);
    }

    // Get vertex labels closure wrapper
    static GETLABELS(query = {}) {
        const GETLABELS = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#GETLABELS(query);
        };
        return new COMMAND(GETLABELS);
    }

    // Get all bookmarks closure wrapper
    static GETBOOKMARKS(query = {}) {
        const GETBOOKMARKS = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#GETBOOKMARKS(query);
        };
        return new COMMAND(GETBOOKMARKS);
    }

    // Remove vertex label closure wrapper
    static UNDOLABEL(query = {}) {
        const UNDOLABEL = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#UNDOLABEL(query);
        };
        return new COMMAND(UNDOLABEL);
    }

    // Remove vertex labels recursively closure wrapper
    static UNDOLABELS(query = {}) {
        const UNDOLABELS = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#UNDOLABELS(query);
        };
        return new COMMAND(UNDOLABELS);
    }

    // Clear labels recursively closure wrapper
    static CLEARLABELS(query = {}) {
        const CLEARLABELS = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#CLEARLABELS(query);
        };
        return new COMMAND(CLEARLABELS);
    }

    // Clear all labels closure wrapper
    static CLEARALL(query = {}) {
        const CLEARALL = ({ bookmarks } = {}) => {
            query.bookmarks = bookmarks;
            return BookmarkDB.#CLEARALL(query);
        };
        return new COMMAND(CLEARALL);
    }
}

// Protected factory class
class COMMAND extends Function {
    constructor(executor) {
        return Object.setPrototypeOf(executor, super());
    }
}
