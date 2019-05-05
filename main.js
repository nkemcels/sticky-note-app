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
});

ipcMain.on("create-new-note", function(event){
    createWindow();
});

function createWindow(params){
    params = params?params:{};
    let window = new BrowserWindow({
        width:760,
        height:460,
        webPreferences:{nodeIntegration:true},
        frame:false,
        ...params
    });
    window.loadURL(url.format({
        pathname:path.join(__dirname, "./dist/index.html"),
        protocol: "file:",
        slashes: true
    }));
    window.on("move", function(){
        let x = window.getBounds().x;
        let y = window.getBounds().y;
        let width = window.getBounds().width;
        let height = window.getBounds().height;

        for (let key in windows){
            if(windows.hasOwnProperty(key) && windows[key].noteWindow == window){
                const state = { x, y, width, height };
                db.saveNoteState(key, state, function(err){
                    if(err){
                        //TODO: unable to save state to database
                    }
                })
                .setCurrentlyFocusedNote(key, function(err){
                    if(err){
                        //TODO: unable to save state to database
                        console.log(err);
                    }
                });
            }
        }
    });
    window.on("focus", function(){
        if(!focusedWindowLoaded) return;
        for (let key in windows){
            if(windows.hasOwnProperty(key) && windows[key].noteWindow == window){
                db.setCurrentlyFocusedNote(key, function(err){
                    if(err){
                        //TODO: unable to save state to database
                        console.log(err);
                    }
                });
            }
        }
    })
    window.on("close", function(){
        window = null;
    });

    return window;
}

let windows={}
let focusedWindowLoaded = false;
function initMainProcess(){
    db.initDatabase(function(err){
        if(err){
            //TODO: handle database initialization failure
        }else{
            db.countNotesAsync(function(err, countRows){
                if(countRows.count===null || countRows.count==0){
                    createWindow();
                }else{
                    let count=0;
                    db.loadAllNotes(function(err, dataRows){
                        db.loadNoteState(dataRows.noteId, function(err, paramRows){
                            let param = {}
                            count++;
                            if(paramRows && !err){
                                const {x, y, width, height} = paramRows;
                                param = {x, y, width, height};
                            }
                            windows[dataRows.noteId] = {
                                noteWindow: createWindow(param),
                                noteData: dataRows
                            };
                            if(count==countRows.count){
                                db.getCurrentlyFocusedNote(function(err, noteIdRow){
                                    if( noteIdRow && windows[noteIdRow.noteId] ){
                                        windows[noteIdRow.noteId].noteWindow.focus();
                                    }
                                });
                                focusedWindowLoaded = true;
                            }
                        });
                    });
                }
            });
        }
    });
}


app.on("ready", initMainProcess);
