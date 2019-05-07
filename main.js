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
    const wind = BrowserWindow.fromWebContents(event.sender);
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
                windows[newNoteId] = {noteWindow: BrowserWindow.fromWebContents(event.sender)};
                let x = wind.getBounds().x, y = wind.getBounds().y, width = wind.getBounds().width, height = wind.getBounds().height;
                const state = { x, y, width, height };
                db.saveNoteState(newNoteId, state, function(err){
                    if(err){
                        //TODO: unable to save state to database
                    }
                })
                .setCurrentlyFocusedNote(newNoteId, function(err){
                    if(err){
                        //TODO: unable to save state to database
                    }
                });
                db.saveNoteAlwaysOnTop(newNoteId, args.alwaysOnTop,function(err){
                    if(err){ 
                        //TODO: could not switch always ontop state
                    }
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
            if(windows[key].noteData.alwaysOnTop==1) wind.setAlwaysOnTop(true, "modal-panel");
            else wind.setAlwaysOnTop(false, "normal");
            return;
        }
    }

    event.sender.send("initial-data-reply", {
        colorTheme: currentTheme
    });
});

ipcMain.on("set-ontop", function(event, args){
    const wind = BrowserWindow.fromWebContents(event.sender);
    if(args.state) wind.setAlwaysOnTop(true, "modal-panel");
    else wind.setAlwaysOnTop(false, "normal");

    if(args.noteId){
        db.saveNoteAlwaysOnTop(args.noteId, args.state,function(err){
            if(err){
                //TODO: could not switch always ontop state
            }
        })
    }
})

ipcMain.on("delete-note", function(event, args){
    const wind = BrowserWindow.fromWebContents(event.sender);
    if(args.noteId){
        db.deleteNote(args.noteId, function(err){
            if(err){
                //TODO: handle error deleting note
            }else{
                wind.close();
                delete windows[args.noteId];
            }
        })
    }else{
        wind.close();
    }
})

ipcMain.on("create-new-note", function(event, args){
    const wind = BrowserWindow.fromWebContents(event.sender);
    let shiftX = 20, shiftY = 20, mx=1, my=1, x=null, y=null;
    if(wind.getBounds().y + wind.getBounds().height + shiftY <= electron.screen.getPrimaryDisplay().size.height ){
        x = wind.getBounds().x;
        y = wind.getBounds().y + wind.getBounds().height + shiftY;
    }
    else{
        if(wind.getBounds().x + wind.getBounds().width + shiftX > electron.screen.getPrimaryDisplay().size.width ){
            mx = -1;
        }
        if(wind.getBounds().y + wind.getBounds().height + shiftY > electron.screen.getPrimaryDisplay().size.height){
            my = 0;
        }
    }
    
    createWindow({ x: x?x:wind.getBounds().x + shiftX*mx,  y: y?y:wind.getBounds().y + shiftY*my, width:wind.getBounds().width, height:wind.getBounds().height });
    currentTheme = args.theme;
});

ipcMain.on("change-theme", function(event, args){
    if(args.noteId){
        db.saveNoteColorTheme(args.noteId, args.theme, function(err){
            if(err){
                //TODO: handle did not save note theme sucessfully
            }else{
                //TODO: handle theme saved successfully
            }
        });
    }
});

function createWindow(params){
    params = params?params:{};
    let window = new BrowserWindow({
        width:680,
        height:420,
        webPreferences:{nodeIntegration:true},
        frame:false,
        ...params
    });
    window.loadURL(url.format({
        pathname:path.join(__dirname, "./dist/index.html"),
        protocol: "file:",
        slashes: true
    }));
    function moveResizeListener(){
        if(!window.hasTimeout){
            window.hasTimeout = true;
            setTimeout(function(){
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
                                console.log("err ", err);
                            }else{

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
                window.hasTimeout = false;
            }, 500);
            
        }
    }
    window.on("move", moveResizeListener);
    window.on("resize", moveResizeListener);
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
    });
    window.on("close", function(){
        window = null;
    });

    return window;
}

let windows={}
let focusedWindowLoaded = false;
let currentTheme;
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
