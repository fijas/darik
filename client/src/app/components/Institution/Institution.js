import React from 'react';
import './Institution.css';
import Paper from "@material-ui/core/Paper/Paper";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";
import Typography from "@material-ui/core/Typography/Typography";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {withStyles} from '@material-ui/core/styles';
import Fab from "@material-ui/core/Fab/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import InstitutionForm from "./InstitutionForm";

const styles = theme => ({
    fab: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed'
    }
});

const types = [{id: 0, name: 'Bank'}, {id: 1, name: 'Financial'}, {id: 2, name: 'Credit Card'}];

class Institution extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isLoading: true,
            showInstitutionForm: false,
            id: ''
        };
    }

    componentDidMount() {
        this.getInstitutions();
    }

    getInstitutions() {
        this.setState({isLoading: true});
        fetch('http://localhost:3001/institutions')
            .then(response => response.json())
            .then(data => this.setState({data: data, isLoading: false}));
    }

    newInstitution = () => {
        this.setState({
            showInstitutionForm: true
        });
    };

    editInstitution = (institution) => {
        this.setState({
            showInstitutionForm: true,
            name: institution.name,
            id: institution.id
        });
    };

    deleteInstitution = (id) => {
        if(window.confirm('Are you sure you want to delete this institution?')) {
            fetch('http://localhost:3001/institutions/' + id, {
                method: 'DELETE'
            }).then((res) => res.json())
                .then(() => this.getCategories())
                .catch((err) => console.log(err));
        }
    };

    closeInstitutionForm() {
        this.getInstitutions();
        this.setState({
            showInstitutionForm: false
        });
    }

    render() {
        const {classes} = this.props;
        const {data, isLoading} = this.state;

        if (isLoading) {
            return <p>Loading ...</p>;
        }

        return (
            <div>
                <InstitutionForm open={this.state.showInstitutionForm} close={this.closeInstitutionForm.bind(this)}
                    types={types} id={this.state.id} />
                <Typography variant="display1" gutterBottom>
                    Institutions
                </Typography>
                <hr/>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Options</TableCell>
                            </TableRow>
                        </TableHead>
                        {data.map(institution => {
                            return (
                                <TableBody key={institution.id}>
                                    <TableRow>
                                        <TableCell>{institution.id}</TableCell>
                                        <TableCell component="th" scope="row">
                                            {institution.name}
                                        </TableCell>
                                        <TableCell>{types.find(x => x.id === institution.type).name}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit" aria-label="Edit">
                                                <Button component="span" className={classes.button}
                                                        onClick={() => this.editInstitution(institution)}>
                                                    <EditIcon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Delete" aria-label="Delete">
                                                <Button component="span" className={classes.button}
                                                        onClick={() => this.deleteInstitution(institution.id)}>
                                                    <DeleteIcon/>
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )
                        })}
                    </Table>
                </Paper>
                <Fab color="primary" className={classes.fab} onClick={this.newInstitution}>
                    <AddIcon/>
                </Fab>
            </div>
        );
    }
}

export default withStyles(styles)(Institution);
