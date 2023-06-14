const BookmarkDB = require("./index.js");
const fs =  require("fs");

// Load and parse
const data = fs.readFileSync("./test.json");
const db = new BookmarkDB(JSON.parse(data));
console.log(typeof db);
console.log(db);
console.log(db instanceof BookmarkDB);
console.log(db instanceof Function);
console.log(db instanceof Object);
console.log(JSON.stringify(db[""], null, 4));
db[""]["staff"].forEach(
    (s) => {
        db[s.name] = s;
        db[s.region] = s;
  }
);
db[""]["offices"].forEach((o) => { db[o.region] = o; });
console.log(db["California"]);
console.log(db["Transylvania"]);
console.log(db["Betty"]);
console.log(db["Veronica"]);
console.log(db["Wednesday"]);
console.log(db["Morticia"]);
db(
    BookmarkDB.ASSIGNVERTEX(
        {
            parent: db[""]["offices"],
            child: {
                region: "UK",
                duty: "Branch",
                opened: "1800-01-01T00:00:00.000Z"
            },
            label: "UK"
        }
    )
);
console.log(JSON.stringify(db[""], null, 4));
console.log(db(BookmarkDB.GETLABELS({ vertex: db["Betty"] })));
console.log(db["UK"]);
console.log(db(BookmarkDB.GETLABELS({ vertex: db["UK"] })));
const e = (x) => { return x + 1; };
try { const c = new COMMAND(e); } catch { console.log("Failed successfully") }
console.log(e);
console.log(db(BookmarkDB.GETBOOKMARKS()));
