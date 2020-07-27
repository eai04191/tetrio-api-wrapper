import { NowRequest, NowResponse } from "@vercel/node";
import got from "got";
import { getToken } from "./util/db";

export default async function (req: NowRequest, res: NowResponse) {
    const { id } = req.query;
    if (!id) {
        res.status(401).json({
            error: { msg: "Missing query parameters: id" },
        });
        return;
    }

    const token = await getToken();
    if (!token) {
        res.status(500).json({ error: "something went wrong." });
        return;
    }

    try {
        const response = await got(`https://tetr.io/api/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token.token}`,
            },
            responseType: "json",
        });
        res.json(response.body);
    } catch (error) {
        console.error(error.response.body);
        res.status(500).json(error.response.body);
    }
    return;
}
