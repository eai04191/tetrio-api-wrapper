import { NowRequest, NowResponse } from "@vercel/node";
import got from "got";
import { getToken } from "./util/db";

export default async function (req: NowRequest, res: NowResponse) {
    const { username } = req.query;
    if (!username) {
        res.status(400).json({
            error: { msg: "Missing query parameters: username" },
        });
        return;
    }

    const token = await getToken();
    if (!token) {
        res.status(500).json({ error: "something went wrong." });
        return;
    }

    try {
        const response = await got(
            `https://tetr.io/api/users/${username}/resolve`,
            {
                headers: {
                    Authorization: `Bearer ${token.token}`,
                },
                responseType: "json",
            }
        );
        res.json({ id: (response.body as any)._id });
    } catch (error) {
        console.error(error.response.body);
        res.status(500).json(error.response.body);
    }
    return;
}
