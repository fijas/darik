const models = require("../models");

// Display list of all Authors.
exports.create = (req, res) => {
    models.transaction.create(req.body).then(transaction => {
        return res.json(transaction);
    });
};

// Display list of all Authors.
exports.list = (req, res) => {
    models.transaction.findAll().then(transaction => {
        return res.json(transaction);
    });
};

// Display list of all Authors.
exports.view = (req, res) => {
    models.transaction.findById(req.params.id).then(transaction => {
        return res.json(transaction);
    });
};

// Display list of all Authors.
exports.update = (req, res) => {
    models.transaction.findById(req.params.id).then(transaction => {
        if(transaction !== null) {
            transaction.update(req.body).then(updatedTransaction => {
                return res.json(updatedTransaction);
            });
        } else {
            return res.sendStatus(404);
        }
    });
};

// Display list of all Authors.
exports.delete = (req, res) => {
    models.transaction.findById(req.params.id).then(transaction => {
        if(transaction !== null) {
            return transaction.destroy();
        } else {
            return res.sendStatus(404);
        }
    });
};
