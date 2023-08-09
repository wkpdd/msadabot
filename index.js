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
const { log, table } = require("console");
const { brotliDecompress } = require("zlib");


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

const checkIfUserExist = (id, data) => {
    sql = `SELECT * FROM users WHERE id=?`
    var res;
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.log(err);
        }
        table(`${row} =+++++++++ >>>>>>> ROW`)
        if (row == undefined) {
            sql = `INSERT INTO users 
        VALUES (?, ?, ?, ?, ?, ?,?,?);`

            db.run(sql, [data.id, data.first_name, data.last_name, data.username, data.is_bot,0,0,0], (res, err) => {
                if (err) {
                    console.log(err);
                }
                console.log(res);
            })
        }
    })
    return res;
}




const addUser = (data) => {
    const { first_name, last_name, username, id, is_bot } = data
    console.log(first_name, last_name, username, id, is_bot);
    checkIfUserExist(id, data)

}


const doaas = [
    'ربِّ اغفِرْ لي خطيئتي يومَ الدِّينَ', 'اللَّهُمَّ إنِّي أَسْأَلُكَ الهُدَى وَالتُّقَى، وَالْعَفَافَ وَالْغِنَى',
    'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِ',
    'للَّهُمَّ آتِنَا في الدُّنْيَا حَسَنَةً وفي الآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ',
    'اللَّهُمَّ إنِّي أَعُوذُ بكَ مِن زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ',
    'اللَّهمَّ إنِّي أعوذُ بِك من شرِّ ما عَمِلتُ، ومن شرِّ ما لم أعمَلْ',
    'اللهم إني أعوذُ بكَ منَ الهمِّ والحزَنِ، وأعوذُ بكَ منَ العجزِ والكسلِ، وأعوذُ بكَ منَ الجُبنِ والبخلِ، وأعوذُ بكَ مِن غلبةِ الدَّينِ وقهرِ الرجالِ',
    'اللَّهُمَّ اغْفِرْ لي وَارْحَمْنِي وَاهْدِنِي وَارْزُقْنِي',
    'اللَّهُمَّ مثبت القُلُوبِ ثبت قُلُوبَنَا علَى طَاعَتِكَ',
    'اللهم انفَعْني بما علَّمتَني وعلِّمْني ما ينفَعُني وزِدْني عِلمًا',
    'اللَّهُمَّ إنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، ولَا يَغْفِرُ الذُّنُوبَ إلَّا أنْتَ، فَاغْفِرْ لي مِن عِندِكَ مَغْفِرَةً إنَّكَ أنْتَ الغَفُورُ الرَّحِيمُ',
    'اللهمَّ إنَّي أعوذُ بك من شرِّ سمْعي، ومن شرِّ بصري، ومن شرِّ لساني، ومن شرِّ قلْبي، ومن شرِّ منيَّتي',
    'اللَّهمَّ إني أعوذُ بكَ من مُنكراتِ الأخلاقِ والأعمالِ والأَهواءِ والأدواءِ',
    'رَّبِّ اغْفِرْ لِي وَلِوَالِدَيَّ',
    'رَبِّ ارحَمهُما كَما رَبَّياني صَغيرًا',
    'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ',
    'رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    'أَصْلِحْ لِي فِي ذُرِّيَّتِي إِنِّي تُبْتُ إِلَيْكَ وَإِنِّي مِنَ الْمُسْلِمِينَ',
    'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    
    'شُكْرًا كَبِيرًا',
    'تَسْلَمْ',
    'مُتَشَكِّر',
    'لَكَ الشُّكْرُ',
    'شُكْرًا لِلْمُسَاعَدَةِ',
    'اللَّهِ يَخْلِيك',
    'الله يرزقك',
    'الله يوفقك',
    'شكرًا وبارك الله فيك',
    'يعطيك العافية',
    'يسلمو إيديك',
    'جزيل الشكر والامتنان'
]



bot.command("start", ctx => {
    addUser(ctx.from)
    ctx.reply(`
    مرحبًا بك في بوت جمع البيانات باللهجة الجزائرية!
    هذا البوت مصمم لجمع بيانات من الجمل باللهجة الجزائرية. ستتمكن من اختيار طول الجملة ومن ثم الحصول على مثال لها، وبعد ذلك ستقوم بكتابة الجملة باللهجة الجزائرية.

    الخطوات:
   
    1. اختر طول الجملة التي تريد: قصيرة، متوسطة، أو طويلة.
    2. قم بترجمة الجملة إلى اللهجة الجزائرية وأرسلها للبوت.
    
    مثال:
    الجملة:
    كيف حالهم؟
    الترجمة:
    كيفاش راهم؟

    يرجى ملاحظة أن البيانات التي تقدمها ستكون مساهمة في تحسين البوت. شكرًا لمساهمتك!
    
    `, {
        reply_markup: {

            inline_keyboard: [

                [
                    { text: 'إضغط هنا للبدأ ', callback_data: 'submit_answer_with_one_more', },

                ],
            ],
        },
    })
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



app.get("/stopBot", (req, res) => {
    bot.stop();
    res.sendStatus(200)
})


app.get("/startBot", (req, res) => {
    bot.launch();
    res.sendStatus(200)
})




app.listen(3000, () => {
    console.log("Listening on 3000");
    log(doaas.length)
})



const currentTranslations = {}


const getNumberOfTranslatedSentences = (ctx, id) => {
    sql = "SELECT short,medium,long FROM users where id=?"

    db.get(sql, [id], (err, rows) => {
        // let s = 0
        // let m = 0
        // let l = 0
        // if (rows != null)
        //     log(rows, rows.length)
        // for (let i = 0; i < rows.length; i++) {

        //     if (rows[i].length == "short") s++
        //     if (rows[i].length == "medium") m++
        //     if (rows[i].length == "long") l++
        // }
        
        ctx.reply('الرجاء اختيار طول الجملة الذي تفضله', {
            // Create an inline keyboard with choices
            reply_markup: {

                inline_keyboard: [

                    [
                        { text: 'قصيرة ' , callback_data: 't_short', },
                        { text: 'متوسطة ' , callback_data: 't_medium' },
                        { text: 'طويلة ' , callback_data: 't_long' },
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
    if (currentTranslations[ctx.chat.id] == null) return;
    console.log(currentTranslations[ctx.chat.id]);
    sql = `INSERT INTO sentence_translation (sentence_id, user_id, dialect_translation, length) VALUES (?,?,?,?);`

    db.run(sql, [currentTranslations[ctx.chat.id].sentence_id, ctx.chat.id, currentTranslations[ctx.chat.id].sentence_translation, currentTranslations[ctx.chat.id].type], (res, err) => {

    })

    sql = `UPDATE sentences
    SET is_processed = 1
    WHERE id = ?;`


    db.run(sql, [currentTranslations[ctx.chat.id].sentence_id], (res, error) => {

    })

     sql1 = "";

    switch (currentTranslations[ctx.chat.id].type) {
        case "short":
            sql1 = `UPDATE users
            SET short = short + 1
            WHERE id = ?;` 
            break;
            case "medium":
            sql1 = `UPDATE users
            SET medium = medium + 1
            WHERE id = ?;` 
            break;
            case "long":
            sql1 = `UPDATE users
            SET long = long + 1
            WHERE id = ?;` 
            break;
    
        default:
            break;
    }


    db.run(sql1, [ctx.chat.id], (res,err)=>{
        if(err) log(err)
    })

    currentTranslations[ctx.chat.id] = null


    ctx.reply(doaas[Math.floor(Math.random() * 31)] + "\n جزاك الله خيرا", {
        reply_markup: {

            inline_keyboard: [

                [
                    { text: 'أضف جملة أخرى  ', callback_data: 'submit_answer_with_one_more', },
                ]

                ,
                [
                    { text: 'قائمة  أكثر عشر أشخاص قامو بالترجمة ', callback_data: 'leaderboard', },
                ]
            ],
        },
    })
}


const leaderboard = (ctx) => {
    sql = "SELECT * FROM users ORDER BY long DESC, medium DESC, short DESC;"
    db.all(sql,(err,res)=>{
        console.log(res);
        str = `----`
        for(var i = 0 ; i < res.length ; i++)
            str += `${res[i].first_name} || s:  ${res[i].short} || m: ${res[i].medium}  || l: ${res[i].long} \n ==== \n`
        
        ctx.reply(str)
    
        })
}

bot.command("leaderboard", (ctx)=>{
    leaderboard(ctx)
})

bot.command('translate', (ctx) => {

    let numberOfTranslatedSentences = getNumberOfTranslatedSentences(ctx, ctx.chat.id)



});

const submit_answer_with_one_more = async (ctx) => {

    if (currentTranslations[ctx.chat.id] != null)
        submit_answer(ctx)

    sql = "SELECT short,medium,long FROM users where id=?"

    db.get(sql, [ctx.chat.id], (err, rows) => {
        // let s = 0
        // let m = 0
        // let l = 0
        // if (rows != null)
        //     log(rows, rows.length)
        // for (let i = 0; i < rows.length; i++) {

        //     if (rows[i].length == "short") s++
        //     if (rows[i].length == "medium") m++
        //     if (rows[i].length == "long") l++
        // }
        log(rows)
        ctx.reply('الرجاء اختيار طول الجملة الذي تفضله', {
            // Create an inline keyboard with choices
            reply_markup: {

                inline_keyboard: [

                    [
                        { text: 'قصيرة ' , callback_data: 't_short', },
                        { text: 'متوسطة ' , callback_data: 't_medium' },
                        { text: 'طويلة ' , callback_data: 't_long' },
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

        case 'leaderboard':
            leaderboard(ctx);
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

    const arabicString = `الجملة الخاصة بك كانت: ${currentTranslations[ctx.chat.id].sentence_text}
\n وترجمتك كانت: \n ${ctx.message.text} \nهل ترغب في تقديم الإجابة؟ \n لإعادة كتابة الإجابة، ما عليك سوى كتابتها مجددًا `;

    if (currentTranslations[ctx.chat.id] != null) {
        currentTranslations[ctx.chat.id].sentence_translation = ctx.message.text
        ctx.reply(arabicString, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "تقديم", callback_data: "submit_answer" },
                        { text: "قدّم وأضف جملة أخرى", callback_data: "submit_answer_with_one_more" },
                    ],
                ]
            }
        })
    }
})




//////////////

////////////////

bot.launch()
