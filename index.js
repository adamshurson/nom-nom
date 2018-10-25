const fs = require('fs');
const express = require('express');
const router = express.Router();

const nom = {
    error: function(res, err) {
        err = err || "Nom Error";
        return res.json({success: false, err: err});
    },
    success: function(res, payload) {
        payload = payload || null;
        return res.json({success: true, payload: payload});
    },
    query: function(model, object, populate) {
        if (populate) {
            const fields = nom.getPopulatedFields(model);
            return model.find(object).populate(fields.join(' ')).exec();
        } else {
            return model.find(object);
        }
    },
    getPopulatedFields: function(model) {
        const populatedFields = [];
        Object.keys(model.schema.obj).map(key => {
            if (model.schema.obj[key] instanceof Object) {
                if (model.schema.obj[key].ref !== undefined) {
                    populatedFields.push(key);
                }
            }
        });
        return populatedFields;
    },
    options: function(model, res) {
        const keys = Object.keys(model.schema.obj);
        nom.success(res, keys);
    },
    put: function(model, res, obj, populate) {
        model.findById(obj._id)
        .then(m => {
            Object.keys(model.schema.obj).map(key => {
                if (obj.hasOwnProperty(key)) {
                    m[key] = obj[key];
                }
            });
            m.save((err, m) => {
                if (err) {
                    nom.error(res, err);
                } else {
                    nom.query(model, m, populate)
                    .then((result) => {
                        nom.success(res, result[0]);
                    })
                    .catch((err) => {
                        nom.error(res, err);
                    });
                }
            });
        })
        .catch(err => nom.error(res, err));
    },
    delete: function(model, res, filter) {
        filter = filter || {};
        model.removeMany(filter)
        .then(() => {
            nom.success(res);
        })
        .catch(err => {
            nom.error(res, err);
        });
    },
    post: function(model, res, body, populate) {
        const object = {};
        Object.keys(model.schema.obj).map(key => {
            if (body.hasOwnProperty(key)) {
                object[key] = body[key];
            }
        });
        const newModel = new model(object);
        newModel.save((err, newModel) => {
            if (err) {
                nom.error(res, err);
            } else {
                nom.query(model, newModel, populate)
                .then((result) => {
                    nom.success(res, result[0]);
                })
                .catch((err) => {
                    nom.error(res, err);
                });
            }
        });
    },
    get: function(model, res, filter, populate) {
        filter = filter || {};
        nom.query(model, filter, populate)
        .then((results) => {
            nom.success(res, results);
        })
        .catch((err) => {
            nom.error(res, err);
        });
    },
    route: function(app) {
        nom.models.map(model => {
            router.route('/' + model.name)
            .get((req, res) => nom.get(model.mongoose, res, req.headers.filter, req.headers.populate))
            .delete((req, res) => nom.delete(model.mongoose, res, req.headers.filter))
            .post((req, res) => nom.post(model.mongoose, res, req.body, req.headers.populate))
            .put((req, res) => nom.put(model.mongoose, res, req.body, req.headers.populate))
            .options((req, res) => nom.options(model.mongoose, res));
        });
    },
    model: function(modelPath, file) {
        const mod = require(modelPath);
        const model = {
            name: file.substring(0, file.indexOf('.js')),
            mongoose: mod
        };
        nom.models.push(model);
    },
    nom: function(modelFolder, rootUrl) {
        if (modelFolder === undefined) {
            err("model folder undefined");
        }
        fs.readdirSync(modelFolder).forEach(function(file) {
            nom.model(modelFolder + "/" + file, file);
        });
        nom.route();
        return router;
    },
    models: []
};

module.exports = nom;