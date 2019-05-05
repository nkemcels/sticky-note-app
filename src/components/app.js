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
            confirmNoteDelete:false
        }

        ipcRenderer.on("initial-data-reply", (event, args)=>{
            this.setState({
                note:args.note,
                noteId:args.noteId,
                theme:args.colorTheme?args.colorTheme:"theme-1"
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
        ipcRenderer.send("create-new-note");
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
        }, ()=>{
            if(!this.state.noteId){
                this.saveNote();
            }
        });

        if(!this.timeoutIsSet && this.state.noteId){
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

    backgroundThemePrimary = (theme)=>{
        switch(theme){
            case "theme-1":
                return "#1E88E5";
            case "theme-2":
                return "red";    
        }
    }

    backgroundThemeSecondary = (theme)=>{
        switch(theme){
            case "theme-1":
                return "#BBDEFB";
            case "theme-2":
                return "green";      
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
                            backgroundThemeSecondary={this.backgroundThemeSecondary} /> 
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
                    <span style={{fontSize:12, marginTop:2}}>
                        <a href="#">
                            <b style={{color:"green"}}>CELS</b> <b style={{color:"blue"}}>BITS</b> @2019
                        </a>    
                    </span>
                </div>
            </div>
        )
    }
}