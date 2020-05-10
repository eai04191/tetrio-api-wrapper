const express = require("express");
const axios = require("axios");
const app = express();

require("dotenv").config();

const getToken = async (username, password) => {
    return await axios
        .post("https://tetr.io/api/users/authenticate", {
            username: username,
            password: password,
        })
        .then((response) => response.data.token)
        .catch((error) => console.error(error));
};

const getProfile = async (token, id) => {
    return await axios
        .get(`https://tetr.io/api/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => response.data.user)
        .catch((error) => console.error(error));
};

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/profile", async (req, res) => {
    if (!req.query.ids) {
        res.status(422).send("ids is required.");
    }

    const ids = req.query.ids.split(",");
    console.log(ids);

    const token = await getToken(process.env.username, process.env.password);
    let profiles = [];

    for (const id of ids) {
        const profile = await getProfile(token, id);
        console.log(profile.username);
        profiles.push(profile);
        console.log(profiles);
    }

    res.send(profiles);
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
