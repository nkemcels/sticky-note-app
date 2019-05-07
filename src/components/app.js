import React, {Component} from "react";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import ThemePopover from "./popover";
import {ipcRenderer} from "electron";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import "./style.css";

export default class StickyNotes extends Component{
    constructor(){
        super();
        this.state = {
            note:"",
            theme:"theme-1",
            noteId:null,
            noteIsSaving:false,
            noteIsSaved:null,
            confirmNoteDelete:false,
            alwaysOnTop:false
        }

        ipcRenderer.on("initial-data-reply", (event, args)=>{
            this.setState({
                note:args.note,
                noteId:args.noteId,
                theme:args.colorTheme?args.colorTheme:"theme-1",
                alwaysOnTop: args.alwaysOnTop === 1
            })
        })

        ipcRenderer.on("save-note-reply", (event, args)=>{
            if(args.status == "OK"){
                this.setState({
                    noteIsSaved:true,
                    noteIsSaving:false,
                    noteId: args.noteId
                });
            }else{
                this.setState({
                    noteIsSaved:false,
                    noteIsSaving:false
                });
            }
        });
    }

    componentDidMount(){
        ipcRenderer.send("initial-data");
    }

    handleDeleteNote = ()=>{
        ipcRenderer.send("delete-note", {noteId:this.state.noteId});
    }

    handleChangeTheme = (theme)=>{
        ipcRenderer.send("change-theme", {noteId:this.state.noteId, theme:theme});
        this.setState({
            theme:theme
        })
    }

    handleAddNewNote = ()=>{
        ipcRenderer.send("create-new-note", {theme:this.state.theme});
    }

    saveNote = ()=>{
        ipcRenderer.send("save-note", {
            noteId: this.state.noteId,
            noteValue: this.state.note
        });
        this.setState({
            noteIsSaving:true,
            noteIsSaved:false
        })
    }

    noteEntryChanged = (evt)=>{
        this.setState({
            note: evt.target.value
        });

        if(!this.timeoutIsSet){
            this.timeoutIsSet = true;
            setTimeout(() => {
                this.saveNote();
                this.timeoutIsSet = false;
            }, 500);
        }
    }

    handleCloseDialog = ()=>{
        this.setState({
            confirmNoteDelete:false
        })
    }

    handleConfirmNoteDelete = ()=>{
        if(this.state.noteId){
            this.setState({
                confirmNoteDelete:true
            });
        }else{
            this.handleDeleteNote();
        }
        
    }

    handleToggleAlwaysOnTop = ()=>{
        this.setState({
            alwaysOnTop:!this.state.alwaysOnTop
        }, ()=>{
            ipcRenderer.send("set-ontop", {state:this.state.alwaysOnTop, noteId:this.state.noteId});
        });
    }

    backgroundThemePrimary = (theme)=>{
        switch(theme){
            case "theme-2":
                return "#C2185B";    
            case "theme-3":
                return "#3949AB";
            case "theme-4":
                return "#00838F";
            case "theme-5":
                return "#F57F17";    
            case "theme-6":
                return "#5D4037";
            case "theme-7":
                return "#37474F";
            case "theme-8":
                return "#2E7D32";    
            case "theme-9":
                return "#BF360C";
            case "theme-10":
                return "#6A1B9A";
            case "theme-11":
                return "#00B8D4";    
            case "theme-12":
                return "#AA00FF";  
            default: case "theme-1":
                return "#1E88E5";                  
        }
    }

    backgroundThemeSecondary = (theme)=>{
        switch(theme){
            case "theme-2":
                return "#FCE4EC";    
            case "theme-3":
                return "#C5CAE9";
            case "theme-4":
                return "#E0F7FA";
            case "theme-5":
                return "#FFFDE7";    
            case "theme-6":
                return "#EFEBE9";
            case "theme-7":
                return "#ECEFF1";
            case "theme-8":
                return "#E8F5E9";    
            case "theme-9":
                return "#FBE9E7";
            case "theme-10":
                return "#F3E5F5";
            case "theme-11":
                return "#E0F7FA";    
            case "theme-12":
                return "#F3E5F5"; 
            default: case "theme-1":
                return "#E3F2FD";                                
        }
    }

    render(){
        return(
            <div className="sticker" style={{backgroundColor:this.backgroundThemePrimary(this.state.theme)}}>
                <div className="sticker-header" style={{backgroundColor:this.backgroundThemePrimary(this.state.theme)}}>
                    <span>
                        <IconButton onClick={this.handleAddNewNote}> <AddIcon /> </IconButton>
                    </span>
                    <span className="drag-bar"></span>
                    <span>
                        <ThemePopover 
                            icon={<MoreIcon />} 
                            open={this.state.themeSelected} 
                            handleChangeTheme={this.handleChangeTheme} 
                            backgroundThemePrimary={this.backgroundThemePrimary}
                            backgroundThemeSecondary={this.backgroundThemeSecondary}
                            alwaysOnTop={this.state.alwaysOnTop}
                            toggleAlwaysOnTop = {this.handleToggleAlwaysOnTop}
                             /> 
                    </span>
                    <span>
                        <IconButton onClick={this.handleConfirmNoteDelete}> <DeleteIcon /> </IconButton>
                    </span>
                </div>
                <div className="sticker-content">
                {this.state.confirmNoteDelete? 
                    <div >
                        <Modal
                            open={this.state.confirmNoteDelete}
                            onClose={this.handleCloseDialog}
                        >
                            <Paper style={{margin:50}}>
                                <Typography variant="h6" style={{marginLeft:15, marginTop:15}}>
                                    <b>Alert</b>
                                </Typography>
                                <hr />
                                <div style={{textAlign:"center"}}>
                                    <Typography variant="subtitle1" style={{marginLeft:15}}>
                                        Do you want to delete this note?
                                    </Typography>
                                </div>
                                <hr />
                                <div style={{marginTop:10, textAlign:"center", padding:10}}>
                                    <Button variant="outlined" color="secondary" style={{marginRight:10}} onClick={this.handleDeleteNote}>
                                        Yes, DELETE
                                    </Button>
                                    
                                    <Button variant="outlined" color="default" onClick={this.handleCloseDialog}>
                                        Cancel
                                    </Button>
                                </div>
                            </Paper>
                        </Modal>
                    </div>
                    :
                    <textarea value={this.state.note} onChange={this.noteEntryChanged} style={{backgroundColor:this.backgroundThemeSecondary(this.state.theme)}} />                    
                }
                    
                </div>
                <div className="sticker-footer"  style={{backgroundColor:this.backgroundThemePrimary(this.state.theme)}}>
                    {this.state.noteIsSaved!==null&&<span style={{color:this.state.noteIsSaved?"green":this.state.noteIsSaving?"yellow":"red", marginLeft:10}}>
                        { 
                            this.state.noteIsSaving? "Saving...":
                            this.state.noteIsSaved?  "Saved": "Failed to Save"  
                        }
                    </span>}
                </div>
            </div>
        )
    }
}