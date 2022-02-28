const { MongoClient } = require("mongodb");
const { getTransporter, mailer } = require("./mailer");
const nodemailer = require("nodemailer");
const multer = require('multer');
const express = require("express");
const cors = require('cors')
const {rm, readFile} = require("fs/promises");
const path = require("path");

const {HIRUS_DB_USER, HIRUS_DB_PASS, PORT, ADD_EMAILS_PASS} = process.env;
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Connection URI
const uri = `mongodb+srv://${HIRUS_DB_USER}:${HIRUS_DB_PASS}@cluster0.chxe8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// Create a new MongoClient
const client = new MongoClient(uri);
async function run() {
    try {
        await rm("./tmp", {
            recursive: true,
            force: true
        });
    } catch {}
    const upload = multer({
        dest: "./tmp",
        limits: {
            fileSize: 1024*1024*25,
        },
    });

  try {
    // Connect the client to the server
    await client.connect();
    const db = client.db("hi-rus");
    await db.collection("emails")
        .createIndex( { "email": 1 }, { unique: true } );
    let stats;
    try {
        stats = await db.collection("stats").findOne();
    } catch {}
    if (!stats) {
        await db.collection("stats").insertOne({
            emails: await db.collection("emails").estimatedDocumentCount(),
            generated: 1000, // estimate as of 2022-02-27T16:32:26.666Z
        });
    }
    
    async function getEmails() {
        return (await db.collection("emails").aggregate([{ $sample: { size: 10 } }]).toArray()).map(u => u.email);
    }
    async function getStats() {
        return (await db.collection("stats").findOne());
    }
    
    async function addEmails(emails) {
        await db.collection("emails").insertMany(emails.map(email => ({email})), {
            ordered: false,
        });
    }

    const transporter = await getTransporter();
    

    // throw "done";

    const app = express();

    app.use(cors());

    
    app.get('/api/stats', async (req, res) => {
        try {
            const stats = await getStats();
            res.json(stats);
        } catch(error) {
            console.error(error);
            res.status(500);
            res.json({error: error.message});
        }
    });

    app.post('/api/send', upload.array("attachments", 5), async (req, res) => {
        try {
            const emails = await getEmails();
            if (!req.body || !req.body.message) {
                throw new Error("Message empty. Please enter the message!")
            }

            await Promise.race(emails.map(async email => {
                try {
                    await transporter.sendMail({
                        from: 'Инициатива "Здравствуй, Русский!" <service@hi-russian.com>', // sender address
                        to: email, // list of receivers
                        subject: "Здравствуй, русский.", // Subject line
                        text: req.body.message, // plain text body
                        attachments: getFiles(req, ["jpg", "png", "bmp", "jpeg"])
                    });
                    console.log(`Message sent to ${email}`);
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            }));


            res.sendStatus(202);
        } catch (error) {
            console.error(error);
            res.status(500);
            res.json({error: error.message})
        }
    });
    
    app.get('/api/emails', async (req, res) => {
        try {
            const emails = await getEmails();
            await db.collection("stats").updateOne({}, {
                $inc: { generated: 10 }
            });
            res.json(emails);
        } catch(error) {
            console.error(error);
            res.status(500);
            res.json({error: error.message});
        }
    });

    app.post('/api/addEmails', upload.array("files", 5), async (req, res) => {
        try {
            if (!req.body || !req.body.password === ADD_EMAILS_PASS) {
                throw("Unauthorized");
            }
            const text = req.body && req.body.text || "";
            const fromFiles = await Promise.all(getFiles(req, ["txt", "dump"]).map(file => readFile(file.path, "utf-8")));
            console.log();
            const lines = fromFiles.concat([text])
                .flatMap(t => t.split("\n"));
            const emails = lines.map(l => l.trim())
                .filter(l => l && l.match(EMAIL_REGEX));
            const unique = Array.from(new Set(emails));
            if (!unique.length) {
                throw new Error("No readable emails found");
            }
            let inserted;
            try {
                const res = await addEmails(unique);
                inserted = res && res.insertedCount;
                
            } catch (error) {
                inserted = error && error.result && error.result.result && error.result.result.nInserted || 0;
                console.error(error);
            }

            if (inserted) {
                res.json({count: inserted});
            } else {
                throw new Error("No new emails inserted");
            }
            await db.collection("stats").updateOne({}, {
                $inc: { emails: inserted }
            });
        } catch(error) {
            console.error(error);
            res.status(400);
            res.json({error: error.message});
        }
    });
    app.use(express.static('../front/build'));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../front/build/index.html"))
    });
    app.listen(PORT || 8080);
  } catch(error) {
    // Ensures that the client will close when you finish/error
    await client.close();
    throw (error);
  }
}
run();

function getFiles(req, extentions = [""]) {
    return (req.files || [])
        .filter(f => extentions.includes(f.originalname.split(".").slice(-1)[0].toLowerCase()))
        .map(file => ({
            ...file,
            filename: file.originalname
        }));
}
