import React from 'react';
import './CategoryForm.css';
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

class CategoryForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            parentId: '',
            name: ''
        };
    }

    handleClose = () => {
        this.props.close();
    };

    handleSave = () => {
        fetch('http://localhost:3001/categories', {
            method: 'POST',
            headers: new Headers(),
            body: JSON.stringify(this.state)
        }).then((res) => res.json())
            .then((data) => console.log(data))
            .catch((err) => console.log(err));
        this.props.close();
    };

    handleChange = (event, name) => {
        let obj = {};
        obj[name] = event.target.value;
        this.setState(obj);
    };

    render() {
        const props = this.props;

        return (
            <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={this.props.open}>
                <DialogTitle id="simple-dialog-title">Add A New Category</DialogTitle>
                <form className={props.container} noValidate autoComplete="off">
                    <DialogContent>
                        <div>
                            <FormControl className={props.formControl} fullWidth={true}>
                                <InputLabel htmlFor="age-simple">Parent Category</InputLabel>
                                <Select
                                    value={this.state.parentId}
                                    onChange={e => this.handleChange(e, 'parentId')}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div>
                            <TextField
                                id="standard-uncontrolled"
                                label="Category"
                                value={this.state.name}
                                onChange={e => this.handleChange(e, 'name')}
                                margin="normal"
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="secondary">
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" className={props.button} onClick={this.handleSave}>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default CategoryForm;
