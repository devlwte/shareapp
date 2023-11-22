const { app, BrowserWindow, dialog } = require('electron');

const path = require("path");
const fs = require("fs");

// axios
const axios = require('axios');



// libraries
const lib = require("../../modules/util-libraries");


const routes = [
    {
        method: 'get',
        path: '/',
        handler: (req, res) => {
            // render
            res.render(path.join(__dirname, "app", "views", "index"));
        }
    },
    {
        method: 'post',
        path: '/php/insert',
        handler: async (req, res) => {
            let { page, ...args } = req.body;
            try {
                let axiosres = await axios.get(page, { params: args.data });
                res.json(axiosres.data);
            } catch (error) {
                res.send(error);
            }
        }
    }
]

module.exports = [...routes, ...lib];