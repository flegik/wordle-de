// Executes actual SQL and constraints in SQLite, not a map pretending to be D1.
const {DatabaseSync}=require('node:sqlite'),fs=require('node:fs'),path=require('node:path');
module.exports=function(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync(path.join(__dirname,'../../online/migrations/0001_rooms.sql'),'utf8'));
 const db={sqlite,prepare(sql){let values=[];const s={bind(...v){values=v;return s;},async first(){return sqlite.prepare(sql).get(...values)||null;},async run(){const r=sqlite.prepare(sql).run(...values);return {success:true,meta:{changes:Number(r.changes)}};},async all(){return {results:sqlite.prepare(sql).all(...values)};}};return s;},async batch(statements){sqlite.exec('BEGIN');try{const rows=[];for(const s of statements)rows.push(await s.run());sqlite.exec('COMMIT');return rows;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};return db;
};
