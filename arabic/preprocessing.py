




f = open("ara_eng.txt", "r")

f_short = open("short_sentences.txt", "w")
f_medium = open("medium_sentences.txt", "w")
f_tall = open("tall_sentences.txt", "w")

data = f.readlines()

totalShort = 0
totalMedium = 0
totalTall = 0 

for s in data:
    l = len(s.split("\t")[1].split(" "))
    short = l <= 5;
    if(short):
        totalShort +=1
        f_short.write(s.split("\t")[1])
        # print(l, totalShort)

    medium = l > 5 and l <= 15;
    if(medium):
        totalMedium += 1
        f_medium.write(s.split("\t")[1])
        # print(l, totalMedium)

    tall = l > 15;
    if(tall):
        totalTall += 1
        f_tall.write(s.split("\t")[1])
        # print(l, totalTall)



print("Short:", totalShort, "Medium:", totalMedium, "Long", totalTall)
    