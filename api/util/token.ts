import got from "got";
require("dotenv").config();

type success = {
    success: true;
    userid: string;
    token: string;
};

type failue = {
    success: false;
    errors: [
        {
            location: string;
            param: string;
            value: string;
            msg: string;
        }
    ];
};

export async function getTokenFromTetrio(): Promise<success | failue> {
    try {
        const response = await got.post(
            "https://tetr.io/api/users/authenticate",
            {
                json: {
                    username: process.env.TETRIO_USERNAME,
                    password: process.env.TETRIO_PASSWORD,
                },
                responseType: "json",
            }
        );
        console.log(response.body);
        return response.body as success;
    } catch (error) {
        console.error(error.response.body);
        return error.response.body as failue;
    }
}
