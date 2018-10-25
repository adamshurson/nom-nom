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
    options: function(model, res) {
        const keys = Object.keys(model.schema.obj);
        nom.success(res, keys);
    },
    put: function(model, res, obj) {
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
                    nom.success(res, m);
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
    post: function(model, res, body) {
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
                nom.success(res, newModel);
            }
        });
    },
    get: function(model, res, filter) {
        filter = filter || {};
        model.find(filter)
        .then(models => {
            nom.success(res, models);
        })
        .catch(err => {
            nom.error(res, err);
        });
    },
    route: function(app) {
        nom.models.map(model => {
            router.route('/' + model.name)
            .get((req, res) => nom.get(model.mongoose, res, req.filter))
            .delete((req, res) => nom.delete(model.mongoose, res, req.filter))
            .post((req, res) => nom.post(model.mongoose, res, req.body))
            .put((req, res) => nom.put(model.mongoose, res, req.body))
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