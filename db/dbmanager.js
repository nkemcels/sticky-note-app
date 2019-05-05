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
    return module.exports;
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
    return module.exports;
}

function loadAllNotes(callback){
    db.serialize(function(){
        db.each("SELECT * FROM notes", [], function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        });
    });
    return module.exports;
}

function loadThisNote(noteId, callback){
    db.serialize(function(){
        db.get("SELECT * FROM notes where noteId=?", [noteId], function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        })
    });
    return module.exports;
}

function deleteNote(noteId, callback){
    db.serialize(function(){
        db.run("DELETE FROM notes WHERE noteId=?", [noteId], function(err){
            if(callback && callback instanceof Function){
                callback(err);
            }
        })
    });
    return module.exports;
}

function countNotesAsync(callback){
    db.serialize(function(){
        db.get("SELECT COUNT(*) count FROM notes", function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        })
    });
    return module.exports;
}

function initDatabase(callback){
    db.serialize(function(){
        db.run("CREATE TABLE IF NOT EXISTS notes (date_created VARCHAR, date_updated VARCHAR, note TEXT, noteId BIGINT PRIMARY KEY)", [], function(err){
            if(callback && callback instanceof Function){
                callback(err);
            }
        })
        .run("CREATE TABLE IF NOT EXISTS noteStates (noteId BIGINT PRIMARY KEY, x INT, y INT, width INT, height INT, colorTheme VARCHAR)")
        .run("CREATE TABLE IF NOT EXISTS focusedNote (id INT PRIMARY KEY, noteId BIGINT)")
        .run("CREATE TABLE IF NOT EXISTS noteColorThemes ( BIGINT PRIMARY KEY, colorTheme VARCHAR)");
    });
    return module.exports;
}

function saveNoteState(noteId, state, callback){
    db.serialize(function(){
        if(!state) return;
        db.run("INSERT OR REPLACE INTO noteStates (noteId, x, y, width, height) VALUES (?, ?, ?, ?, ?)", 
            [noteId, state.x, state.y, state.width, state.height], 
            function(err){
                if(callback && callback instanceof Function){
                    callback(err);
                }
            }
        );
    });
    return module.exports;
}

function setCurrentlyFocusedNote(noteId, callback){
    db.serialize(function(){
        db.run("INSERT OR REPLACE INTO focusedNote (id, noteId) VALUES(?, ?)", [1, noteId], function(err){
            if(callback && callback instanceof Function){
                callback(err);
            }
        });
    });
    return module.exports;
}

function getCurrentlyFocusedNote(callback){
    db.serialize(function(){
        db.get("SELECT noteId FROM focusedNote", function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        });
    });
    return module.exports;
}


function loadNoteState(noteId, callback){
    db.serialize(function(){
        db.get("SELECT * FROM noteStates WHERE noteId=?", [noteId], function(err, row){
            if(callback && callback instanceof Function){
                callback(err, row);
            }
        })
    });
    return module.exports;
}

module.exports = {
    initDatabase,
    updateNote,
    createNewNote,
    loadAllNotes,
    loadThisNote,
    deleteNote,
    saveNoteState,
    loadNoteState,
    setCurrentlyFocusedNote,
    getCurrentlyFocusedNote,
    countNotesAsync
}