doaa = open("doaa.txt", "r")



doaa = doaa.readlines()

s = '['
for d in doaa:
    d.replace("`","")
    d.replace("\n","")
    s+= "'"+ d+"', "

s+= "]"

print(s)