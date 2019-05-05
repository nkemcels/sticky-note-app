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
                //TODO: handle failed to update note 
            }else{
                //TODO: handle save note successful
            }
        });
    }else{
        db.createNewNote(noteValue, function(err, noteId){
            if(err){
                //TODO: handle failed to create new note
            }else{
                
            }
        });
    }
});

let testWindow;
function createWindow(note, noteId){
    testWindow = new BrowserWindow({
        width:760,
        height:460,
        webPreferences:{nodeIntegration:true},
        frame:false
    });
    testWindow.loadURL(url.format({
        pathname:path.join(__dirname, "./dist/index.html"),
        protocol: "file:",
        slashes: true
    }));
    testWindow.on("close", function(){
        testWindow = null;
    });
}

function initMainProcess(){
    db.initDatabase();
    db.countNotesAsync(function(rows){
        if(rows===null){
            createWindow();
        }else{
            db.loadAllNotes(function(err, row){
                //load all notes here
            });
        }
    })
}


app.on("ready", initMainProcess);
