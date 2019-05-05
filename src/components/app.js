import React, {Component} from "react";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import MorePopover from "./popover"
import {ipcRenderer} from "electron"
import "./style.css";

export default class StickyNotes extends Component{
    constructor(){
        super();
        this.state = {
            note:"",
            noteId:null,
            noteIsSaving:false,
            noteIsSaved:null
        }

        ipcRenderer.on("initial-data-reply", (event, args)=>{
            this.setState({
                note:args.note,
                noteId:args.noteId
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

    }

    handleExpandMore = ()=>{

    }

    handleAddNewNote = ()=>{

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

    render(){
        return(
            <div className="sticker">
                <div className="sticker-header">
                    <span>
                        <IconButton onClick={this.handleAddNewNote}> <AddIcon /> </IconButton>
                    </span>
                    <span className="drag-bar"></span>
                    <span>
                        <MorePopover onClick={this.handleExpandMore} icon={<MoreIcon />}> 
                            <div className="more-menu-content">
                                <span style={{backgroundColor:"red"}} />
                                <span style={{backgroundColor:"green"}} />
                                <span style={{backgroundColor:"blue"}} />
                                <span style={{backgroundColor:"orange"}} />
                                <span style={{backgroundColor:"pink"}} />
                            </div>
                        </MorePopover>
                    </span>
                    <span>
                        <IconButton onClick={this.handleDeleteNote}> <DeleteIcon /> </IconButton>
                    </span>
                </div>
                <div className="sticker-content">
                    <textarea value={this.state.note} onChange={this.noteEntryChanged}></textarea>
                </div>
                <div className="sticker-footer">
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