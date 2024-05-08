raw = input() # copy the line right under achievements
bin = raw.replace('\u200B', '0').replace('\u200D', '1')
print(int(bin, 2))