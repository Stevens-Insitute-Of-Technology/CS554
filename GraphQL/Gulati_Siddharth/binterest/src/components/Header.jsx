import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";

export default function Header() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton href="/my-bin">
            <DeleteOutlineIcon
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            ></DeleteOutlineIcon>
          </IconButton>
          <IconButton href="/">
            <Typography variant="h6" color="inherit" component="div">
              Binterest
            </Typography>
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
