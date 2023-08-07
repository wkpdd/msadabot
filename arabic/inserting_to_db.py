import sqlite3
con = sqlite3.connect("../dbs/data.db")

cur = con.cursor()

short_sentences =  open("short_sentences.txt", "r" )

short_sentences = short_sentences.readlines()


medium_sentences =  open("medium_sentences.txt", "r" )

medium_sentences = medium_sentences.readlines()

long_sentences =  open("tall_sentences.txt", "r" )

long_sentences = long_sentences.readlines()


print("short")
for sentence in short_sentences:
    sentence = sentence.replace("\n","")
    sentence = sentence.replace("?","")
    sentence = sentence.replace("!","")
    sentence = sentence.replace(".","")
    sql = "INSERT INTO sentences (sentence_text, length) values ( '"+ sentence +"',  'short')"
    cur.execute(sql)
    con.commit()


print("medium")
for sentence in medium_sentences:
    sentence = sentence.replace("\n","")
    sentence = sentence.replace(".","")
    sql = "INSERT INTO sentences (sentence_text, length) values ( '"+ sentence +"',  'medium')"
    cur.execute(sql)
    con.commit()


print("long")
for sentence in long_sentences:
    sentence = sentence.replace("\n","")
    sentence = sentence.replace(".","")
    sql = "INSERT INTO sentences (sentence_text, length) values ( '"+ sentence +"',  'long')"
    cur.execute(sql)
    con.commit()




con.close()
