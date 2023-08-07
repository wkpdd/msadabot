const express = require("express")
const app = express()
const sqlite3 = require('sqlite3').verbose();
const axios = require("axios");
const path = require("path")
const port = process.env.PORT || 3000;
app.use(express.static('static'))
app.use(express.json());
require('dotenv').config();

const { Telegraf } = require('telegraf');
const { type } = require("os");
const { cursorTo } = require("readline");
const { log } = require("console");


const bot = new Telegraf(process.env.BOT_TOKEN);

let db = new sqlite3.Database('./dbs/data.db');


const createDb = () => {


    sql = ` CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        is_bot INTEGER
    );`



    sql2 = `CREATE TABLE sentences (
        sentence_id INTEGER PRIMARY KEY,
        sentence_text TEXT,
        length TEXT CHECK(length IN ('short', 'medium', 'long'))    
    );`



    sql3 = `CREATE TABLE sentence_translation (
        translation_id INTEGER PRIMARY KEY,
        sentence_id INTEGER,
        user_id INTEGER,
        dialect_translation TEXT,
        FOREIGN KEY (sentence_id) REFERENCES sentences(sentence_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );`



    db.run(sql, function (err) {
        if (err) {
            console.log(err, "####");
            bot.telegram.sendMessage(process.env.ADMIN_ID, `${sql}::: \n\n ${err.message} \n\n :::`)
        }
    })

    db.run(sql2, function (err) {
        if (err) {
            console.log(err, "####");
            bot.telegram.sendMessage(process.env.ADMIN_ID, `${sql2}::: \n\n ${err.message} \n\n :::`)
        }
    })

    db.run(sql3, function (err) {
        if (err) {
            console.log(err, "####");
            bot.telegram.sendMessage(process.env.ADMIN_ID, `${sql3}::: \n\n ${err.message} \n\n :::`)
        }
    })


}

const checkIfUserExist = (id) => {
    sql = `SELECT * FROM users WHERE id=?`

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.log(err);
        }

        row ? console.log("exist") : console.log("new_user");
        return row
    })
}

const saveUser = (data) => {
    sql = `INSERT INTO users 
    VALUES (?, ?, ?, ?, ?);`

    db.run(sql, [data.id, data.first_name, data.last_name, data.username, data.is_bot], (res, err) => {
        if (err) {
            console.log(err);
        }
        console.log(res);
    })

    
}


const addUser = (data) => {
    const { first_name, last_name, username, id, is_bot } = data
    console.log(first_name, last_name, username, id, is_bot);
    if (checkIfUserExist(id))
        saveUser(data)

}



bot.command("start", ctx => {
    addUser(ctx.from)
})



bot.command('fetch', ctx => {
    db.get("select * from users", (err, rows) => {
        for (row in rows)
            console.log(row);
    })
})

app.get("/initDatabase", (req, res) => {
    createDb()
    res.send(200)
})



app.listen(3000, () => {
    console.log("Listening on 3000");
})



const currentTranslations = {}


const getNumberOfTranslatedSentences = (ctx, id) => {
    sql = "SELECT length FROM sentence_translation where user_id=?"

    db.all(sql, [id], (err, rows) => {
        let s = 0
        let m = 0
        let l = 0
        if (rows != null)
            log(rows, rows.length)
        for (let i = 0; i < rows.length; i++) {

            if (rows[i].length == "short") s++
            if (rows[i].length == "medium") m++
            if (rows[i].length == "long") l++
        }
        ctx.reply('Please Select the length you prefer', {
            // Create an inline keyboard with choices
            reply_markup: {

                inline_keyboard: [

                    [
                        { text: 'Short ' + s, callback_data: 't_short', },
                        { text: 'Medium ' + m, callback_data: 't_medium' },
                        { text: 'Long ' + l, callback_data: 't_long' },
                    ],
                ],
            },
        });
    })
}


const t_short = async (ctx) => {

    sql = `SELECT * FROM sentences
    WHERE is_processed = 0 AND length='short'
    ORDER BY id
    LIMIT 1;`
    let sentence_text = ""
    db.get(sql, (err, row) => {
        log(row.sentence_text)
        sentence_text = row.sentence_text
        sentence_text = sentence_text.replace("!","")
        currentTranslations[ctx.chat.id] = {
            type: "short",
            sentence_text: sentence_text,
            sentence_id: row.id,

        }
        console.log(currentTranslations);
        ctx.reply(sentence_text)
    })
}

const t_medium = async (ctx) => {
    sql = `SELECT * FROM sentences
    WHERE is_processed = 0 AND length='medium'
    ORDER BY id
    LIMIT 1;`
    let sentence_text = ""
    db.get(sql, (err, row) => {
        log(row.sentence_text)
        sentence_text = row.sentence_text
        sentence_text = sentence_text.replace("!","")
        currentTranslations[ctx.chat.id] = {
            type: "medium",
            sentence_text: sentence_text,
            sentence_id: row.id,

        }
        console.log(currentTranslations);
        ctx.reply(sentence_text)
    })
}

const t_long = async (ctx) => {
    sql = `SELECT * FROM sentences
    WHERE is_processed = 0 AND length='long'
    ORDER BY id
    LIMIT 1;`
    let sentence_text = ""
    db.get(sql, (err, row) => {
        log(row.sentence_text)
        sentence_text = row.sentence_text
        sentence_text = sentence_text.replace("!","")
        currentTranslations[ctx.chat.id] = {
            type: "long",
            sentence_text: sentence_text,
            sentence_id: row.id,
    

        }
        console.log(currentTranslations);
        ctx.reply(sentence_text)
    })
}
// of sentence that you want to translate
// example: .... 

const submit_answer = async (ctx) => {
    if(currentTranslations[ctx.chat.id] == null) return;
    console.log(currentTranslations[ctx.chat.id]);
    sql = `INSERT INTO sentence_translation (sentence_id, user_id, dialect_translation, length) VALUES (?,?,?,?);`
    
    db.run(sql, [currentTranslations[ctx.chat.id].sentence_id, ctx.chat.id, currentTranslations[ctx.chat.id].sentence_translation, currentTranslations[ctx.chat.id].type ], (res, err)=>{

    })

    sql = `UPDATE sentences
    SET is_processed = 1
    WHERE id = ?;`

    db.run(sql, [currentTranslations[ctx.chat.id].sentence_id], (res,error)=>{

    })
    currentTranslations[ctx.chat.id] = null
    ctx.reply("الله بجازيك خير")
}


bot.command('translate', (ctx) => {

    let numberOfTranslatedSentences = getNumberOfTranslatedSentences(ctx, ctx.chat.id)



});

const submit_answer_with_one_more = async (ctx) => { 

    if(currentTranslations[ctx.chat.id] != null)
    submit_answer(ctx)

    sql = "SELECT length FROM sentence_translation where user_id=?"

    db.all(sql, [ctx.chat.id], (err, rows) => {
        let s = 0
        let m = 0
        let l = 0
        if (rows != null)
            log(rows, rows.length)
        for (let i = 0; i < rows.length; i++) {

            if (rows[i].length == "short") s++
            if (rows[i].length == "medium") m++
            if (rows[i].length == "long") l++
        }
        ctx.reply('Please Select the length you prefer', {
            // Create an inline keyboard with choices
            reply_markup: {

                inline_keyboard: [

                    [
                        { text: 'Short ' + s, callback_data: 't_short', },
                        { text: 'Medium ' + m, callback_data: 't_medium' },
                        { text: 'Long ' + l, callback_data: 't_long' },
                    ],
                ],
            },
        });
    })
}


// Callback query handler for the inline choices
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    let response = '';

    switch (data) {
        case 't_short':
            t_short(ctx);
            break;
        case 't_medium':
            t_medium(ctx);
            break;
        case 't_long':
            t_long(ctx);
            break;

        case 'submit_answer':
            submit_answer(ctx)
            break;

        case 'submit_answer_with_one_more':
            submit_answer_with_one_more(ctx)
            break;
        default:
            response = 'Invalid choice.';
    }

    // ctx.reply(response);
});

bot.command('cancel', async (ctx) => {
    if (currentTranslations[ctx.chat.id] !== null) {
        currentTranslations[ctx.chat.id] = null
    }
})


bot.on('message', async (ctx) => {
    if (currentTranslations[ctx.chat.id] != null) {
        currentTranslations[ctx.chat.id].sentence_translation = ctx.message.text
        ctx.reply(`your sentence was  ${currentTranslations[ctx.chat.id].sentence_text}
        \n and your tanslation was: \n ${ctx.message.text} \nyou want to submit the answer ? \n to rewrite the answer just type it again :cool:`, {
            reply_markup: {
                inline_keyboard: [
                   [
                    { text: "Submit", callback_data: "submit_answer" },
                    { text: "Submit & add one more", callback_data: "submit_answer_with_one_more" },
                   ],
                ]
            }
        })
    }
})


//////////////

////////////////

bot.launch()
