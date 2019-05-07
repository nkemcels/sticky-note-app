import React from "react"
import Popover from "@material-ui/core/Popover";
import IconButton from '@material-ui/core/IconButton';
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";


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
        <div style={{textAlign:"center", margin:"5px 0px"}}><b>Select Theme Color</b></div>
          <div className="more-menu-content">
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-1")}} onClick={()=>this.handleChangeTheme("theme-1")}/>
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-2")}} onClick={()=>this.handleChangeTheme("theme-2")}/>
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-3")}} onClick={()=>this.handleChangeTheme("theme-3")} />
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-4")}} onClick={()=>this.handleChangeTheme("theme-4")} />
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-5")}} onClick={()=>this.handleChangeTheme("theme-5")}/>
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-6")}} onClick={()=>this.handleChangeTheme("theme-6")}/>
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-7")}} onClick={()=>this.handleChangeTheme("theme-7")} />
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-8")}} onClick={()=>this.handleChangeTheme("theme-8")} />
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-9")}} onClick={()=>this.handleChangeTheme("theme-9")}/>
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-10")}} onClick={()=>this.handleChangeTheme("theme-10")}/>
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-11")}} onClick={()=>this.handleChangeTheme("theme-11")} />
              <span style={{backgroundColor:this.props.backgroundThemePrimary("theme-12")}} onClick={()=>this.handleChangeTheme("theme-12")} />
          </div>
          <div style={{marginTop:5, marginLeft:10}}>
              <FormControlLabel control={<Switch checked={this.props.alwaysOnTop} onChange={this.props.toggleAlwaysOnTop} />} label="Always On-Top" />
          </div>
        </Popover>
      </div>
    );
  }
}
