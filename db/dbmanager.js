const sqlite3 = require("sqlite3");
const path = require("path");
const db = new sqlite3.Database(path.join(__dirname, "..", "bin/sticky-notes.db"))

function getDateTodayStr(){
    const date = new Date();
    const dateStr = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()
    return dateStr;
}

function updateNote(noteId, note, callback){
    const dateStr = getDateTodayStr();
    db.serialize(function(){
        db.run("UPDATE notes SET note=?, date_updated=? WHERE noteId=?", [note, dateStr, noteId], function(err){
            if(callback && callback instanceof Function){
                callback(err);
            }
        });
    });
}

function createNewNote(note, callback){
    db.serialize(function(){
        const noteId = new Date().getTime();
        const createdDate = getDateTodayStr();
        db.run("INSERT INTO notes (note, noteId, date_created, date_updated) VALUES(?, ?, ?, ?)", [note, noteId, createdDate, createdDate], function(err){
            if(callback && callback instanceof Function){
                callback(err, noteId);
            }
        });
    });
}

function loadAllNotes(callback){
    db.serialize(function(){
        db.each("SELECT * FROM notes", [], function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        });
    });
}

function loadThisNote(noteId, callback){
    db.serialize(function(){
        db.get("SELECT * FROM notes where noteId=?", [noteId], function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        })
    });
}

function deleteNote(noteId, callback){
    db.serialize(function(){
        db.run("DELETE FROM notes WHERE noteId=?", [noteId], function(err){
            if(callback && callback instanceof Function){
                callback(err);
            }
        })
    });
}

function countNotesAsync(callback){
    db.serialize(function(){
        db.each("SELECT COUNT(*) count FROM notes", function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        })
    });
}

function initDatabase(callback){
    db.serialize(function(){
        db.run("CREATE TABLE IF NOT EXISTS notes (date_created VARCHAR, date_updated VARCHAR, note TEXT, noteId BIGINT PRIMARY KEY)", [], function(err){
            if(callback && callback instanceof Function){
                callback(err);
            }
        });
    })
}


module.exports = {
    initDatabase,
    updateNote,
    createNewNote,
    loadAllNotes,
    loadThisNote,
    deleteNote,
    countNotesAsync
}