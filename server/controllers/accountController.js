const models = require("../models");

// Display list of all Authors.
exports.create = (req, res) => {
    models.account.create(req.body).then(account => {
        return res.json(account);
    });
};

// Display list of all Authors.
exports.list = (req, res) => {
    models.account.findAll().then(account => {
        return res.json(account);
    });
};

// Display list of all Authors.
exports.view = (req, res) => {
    models.account.findByPk(req.params.id).then(account => {
        return res.json(account);
    });
};

// Display list of all Authors.
exports.update = (req, res) => {
    models.account.findByPk(req.params.id).then(account => {
        if(account !== null) {
            account.update(req.body).then(updatedAccount => {
                return res.json(updatedAccount);
            });
        } else {
            return res.sendStatus(404);
        }
    });
};

// Display list of all Authors.
exports.delete = (req, res) => {
    models.account.findByPk(req.params.id).then(account => {
        if(account !== null) {
            return account.destroy();
        } else {
            return res.sendStatus(404);
        }
    });
};
