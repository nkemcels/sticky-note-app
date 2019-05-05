import React, {Component} from "react";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import "./style.css";
export default class StickyNotes extends Component{
    render(){
        return(
            <div className="sticker">
                <div className="sticker-header">
                    <span>
                        <IconButton> <AddIcon /> </IconButton>
                    </span>
                    <span className="drag-bar"></span>
                    <span>
                        <IconButton> <MoreIcon /> </IconButton>
                    </span>
                    <span>
                        <IconButton> <DeleteIcon /> </IconButton>
                    </span>
                </div>
                <div className="sticker-content">
                    <textarea></textarea>
                </div>
            </div>
        )
    }
}