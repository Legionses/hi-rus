const { MongoClient } = require("mongodb");
const { getTransporter, mailer } = require("./mailer");
const nodemailer = require("nodemailer");
const multer = require('multer');
const express = require("express");
const cors = require('cors')
const {rm, readFile} = require("fs/promises");

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
    const coll = client.db("hi-rus").collection("emails");
    await coll.createIndex( { "email": 1 }, { unique: true } )

    
    async function getEmails() {
        return (await coll.aggregate([{ $sample: { size: 10 } }]).toArray()).map(u => u.email);
    }

    const emails = await getEmails();
    const transporter = await getTransporter();
    

    // throw "done";

    const app = express();

    app.use(cors());

    app.post('/api/send', upload.array("attachments", 5), async (req, res) => {
        try {
            if (!req.body || !req.body.message) {
                throw new Error("Message empty. Please enter the message!")
            }

            const info = await transporter.sendMail({
                from: 'Hi Russian Project <service@hi-russian.com>', // sender address
                to: emails.join(", "), // list of receivers
                subject: "Здравствуй, русский.", // Subject line
                text: req.body.message, // plain text body
                attachments: getFiles(req, ["jpg", "png", "bmp", "jpeg"])
            });

            console.log("Message sent: %s", info.message);

            res.sendStatus(200);
        } catch (error) {
            res.status(400);
            res.json({error: error.message})
        }
    });

    app.post('/api/addEmails', upload.array("files", 5), async (req, res) => {
        try {
            if (!req.body || !req.body.password === ADD_EMAILS_PASS) {
                throw("Unauthorized");
            }
            const text = req.body && req.body.text || "";
            const fromFiles = await Promise.all(getFiles(req, [".txt", ".dump"]).map(async file => readFile(file.path, "utf-8")));
            const emails = fromFiles.concat([text])
                .flatMap(t => t.split("\n"))
                .map(l => l.trim())
                .filter(l => l && l.match(EMAIL_REGEX));
            const unique = Array.from(new Set(emails));
            if (!unique.length) {
                throw new Error("No readable emails found");
            }
            try {
                const inserted = await coll.insertMany(unique.map(email => ({email})), {
                    ordered: false,
                });
                res.json({count: inserted.insertedCount});
            } catch {
                res.json({error: "Some, but maybe not all emails failed to add. Check the DB size"});
            }
        } catch(error) {
            res.status(400);
            res.json({error: error.message});
        }
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