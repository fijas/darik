import React from 'react';
import './Category.css';
import Paper from "@material-ui/core/Paper/Paper";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";
import Button from "@material-ui/core/Button/Button";
import CategoryForm from "./CategoryForm/CategoryForm";
import Typography from "@material-ui/core/Typography/Typography";
import AddIcon from '@material-ui/icons/Add';
import {withStyles} from '@material-ui/core/styles';

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

class Category extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isLoading: true,
            showCategoryForm: false
        };
    }

    componentDidMount() {
        this.getCategories();
    }

    getCategories() {
        this.setState({isLoading: true});
        fetch('http://localhost:3001/categories')
            .then(response => response.json())
            .then(data => this.setState({data: data, isLoading: false}));
    }

    handleClickOpen = () => {
        this.setState({
            showCategoryForm: true
        });
    };

    closeForm() {
        this.setState({
            showCategoryForm: false
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
                <CategoryForm open={this.state.showCategoryForm} close={this.closeForm.bind(this)}/>
                <Typography variant="display1" gutterBottom>
                    Categories
                </Typography>
                <hr/>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell numeric>Sub Categories</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map(row => {
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell numeric>0</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
                <Button variant="fab" color="primary" className={classes.fab} onClick={this.handleClickOpen}>
                    <AddIcon/>
                </Button>
            </div>
        );
    }
}

export default withStyles(styles)(Category);
