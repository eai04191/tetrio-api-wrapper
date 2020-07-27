// https://vercel.com/guides/deploying-a-mongodb-powered-api-with-node-and-vercel
import { MongoClient, Db, ObjectId } from "mongodb";
import { getTokenFromTetrio } from "./token";
require("dotenv").config();

// Create cached connection variable
let cachedDb: Db | null = null;

// A function for connecting to MongoDB,
// taking a single parameter of the connection string
async function connectToDatabase(uri: string) {
    // If the database connection is cached,
    // use it instead of creating a new connection
    if (cachedDb) {
        return cachedDb;
    }

    // If no connection is cached, create a new one
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Select the database through the connection,
    // using the database path of the connection string
    const db = await client.db(new URL(uri).pathname.substr(1));

    // Cache the database connection and return the connection
    cachedDb = db;
    return db;
}

async function getDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("Missing Env: MONGODB_URI");
    }

    const db = await connectToDatabase(uri);
    return db;
}

type tokenCollections = {
    _id?: ObjectId;
    token: string;
    createdAt: Date;
};

export async function getToken() {
    const db = await getDb();
    const collection = db.collection<tokenCollections>("token");
    console.log("Search token from DB...");
    const tokenCollection = await collection.findOne({});

    if (tokenCollection) {
        console.log("I got token from DB...");
        const currentTime = Math.floor(new Date().getTime() / 1000);
        const tokenCreatedTime = Math.floor(
            tokenCollection.createdAt.getTime() / 1000
        );

        // tokenを取得してから30分(60x30 sec)経過していなければDBのを返す
        if (currentTime - tokenCreatedTime < 60 * 30) {
            console.log("a token is seems fresh! use this");
            return {
                token: tokenCollection.token,
                createdAt: tokenCollection.createdAt,
            };
        }
    }
    // DBの中にない or
    // 30分経過しているので再取得
    console.log("Getting new token from TETR.IO...");
    const token = await getTokenFromTetrio();
    if (token.success) {
        console.log("Update DB...");
        const obj = { token: token.token, createdAt: new Date() };
        // 空{}はコレクションの最初のオブジェクト
        await collection.updateOne({}, { $set: obj }, { upsert: true });
        return obj;
    } else {
        console.error("failed to fetch token from tetrio.");
        return null;
    }
}
