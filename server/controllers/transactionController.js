const models = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Display list of all Authors.
exports.create = (req, res) => {
    models.transaction.create(req.body).then(transaction => {
        return res.json(transaction);
    });
};

// Display list of all Authors.
exports.list = (req, res) => {
    let where = {};
    if(req.query.type === '0') {
        where.debit = {
            [Op.gt]: 0
        }
    } else {
        where.credit = {
            [Op.gt]: 0
        }
    }
    models.transaction.findAll({
        where: where,
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(transaction => {
        return res.json(transaction);
    });
};

// Display list of all Authors.
exports.view = (req, res) => {
    models.transaction.findByPk(req.params.id).then(transaction => {
        return res.json(transaction);
    });
};

// Display list of all Authors.
exports.update = (req, res) => {
    models.transaction.findByPk(req.params.id).then(transaction => {
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
    models.transaction.findByPk(req.params.id).then(transaction => {
        if(transaction !== null) {
            return transaction.destroy();
        } else {
            return res.sendStatus(404);
        }
    });
};
