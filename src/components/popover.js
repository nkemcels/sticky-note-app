import React from "react"
import Popover from "@material-ui/core/Popover";
import IconButton from '@material-ui/core/IconButton';


export default class SimpleThemePopover extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  handleChangeTheme = (theme)=>{
    this.handleClose();
    this.props.handleChangeTheme(theme);
  }

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <IconButton
          aria-owns={open ? 'simple-popper' : undefined}
          aria-haspopup="true"
          variant="contained"
          onClick={this.handleClick}
        >
          {this.props.icon}
        </IconButton>
        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div className="more-menu-content">
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-1")}} onClick={()=>this.handleChangeTheme("theme-1")}/>
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-2")}} onClick={()=>this.handleChangeTheme("theme-2")}/>
              <span style={{backgroundColor:"blue"}} />
              <span style={{backgroundColor:"orange"}} />
              <span style={{backgroundColor:"pink"}} />
              <span style={{backgroundColor:"red"}} />
              <span style={{backgroundColor:"green"}} />
              <span style={{backgroundColor:"blue"}} />
              <span style={{backgroundColor:"green"}} />
              <span style={{backgroundColor:"blue"}} />
          </div>
        </Popover>
      </div>
    );
  }
}
