const electron = require("electron");

const url = require("url");
const path = require("path");

const db = require("./db/dbmanager");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const ipcMain = electron.ipcMain;

ipcMain.on("save-note", function(event, args){
    const noteId = args.noteId;
    const noteValue = args.noteValue;
    if(noteId){
        db.updateNote(noteId, noteValue, function(err){
            if(err){
                event.sender.send("save-note-reply", { 
                    status: "FAILED"
                });
            }else{
                event.sender.send("save-note-reply", {
                    status: "OK",
                    noteId: noteId
                });
            }
        });
    }else{
        db.createNewNote(noteValue, function(err, newNoteId){
            if(err){
                event.sender.send("save-note-reply", { 
                    status: "FAILED"
                });
            }else{
                event.sender.send("save-note-reply", {
                    status: "OK",
                    noteId: newNoteId
                });
            }
        });
    }
});

ipcMain.on("initial-data", function(event, args){
    const wind = BrowserWindow.fromWebContents(event.sender);
    for(let key in windows){
        if(windows.hasOwnProperty(key) && windows[key].noteWindow == wind ){
            event.sender.send("initial-data-reply", {
                ...windows[key].noteData
            });
        }
    }
})

function createWindow(params){
    let window = new BrowserWindow({
        width:760,
        height:460,
        webPreferences:{nodeIntegration:true},
        frame:false
    });
    window.loadURL(url.format({
        pathname:path.join(__dirname, "./dist/index.html"),
        protocol: "file:",
        slashes: true
    }));
    window.on("close", function(){
        window = null;
    });

    return window;
}

let windows={}
function initMainProcess(){
    db.initDatabase(function(err){
        if(err){
            //TODO: handle database initialization failure
        }else{
            db.countNotesAsync(function(err, rows){
                if(rows.count===null || rows.count==0){
                    createWindow();
                }else{
                    db.loadAllNotes(function(err, row){
                        windows[row.noteId] = {
                                noteWindow: createWindow(),
                                noteData: row
                        }
                    });
                }
            })
        }
    });
}


app.on("ready", initMainProcess);
