const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const url = require("url");
const path = require("path");

const sqlite = require("sqlite3")

const ipcMain = electron.ipcMain;

ipcMain.on("my-msg", function(event){
    event.returnValue = "HELLO THERE";
})

let testWindow;
function createWindow(){
    testWindow = new BrowserWindow({
        width:750,
        height:500,
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
    })
}

app.on("ready", createWindow);
