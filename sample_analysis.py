from getdata import get_data
import datetime

print get_data("projector.*on").raw()

minDate = datetime.datetime.now()-datetime.timedelta(days=7)
print get_data("projector.*on", minDate, datetime.datetime(2017, 6, 10)).raw()
print get_data("projector.*on", minDate, datetime.datetime(2017, 6, 10)).values()

sample_data =  get_data("projector.*on").first()
print "Example projector on signal:"
print sample_data  # like "3169354 167 84 11 30 11 31 12 30 10 11 10 32 10 12 9 31 12 30 11 83 10 31 11 31 11 11 10 31 10 11 10 11 11 11 9 11 12"

s = [int(i) for i in sample_data.split(" ")]
s = s[1:]
print "header", s[:2]  # like "header [167, 84]"
s = s[2:]
binary_s = [i//30 for i in s]
binary_s = binary_s[1::2]  # drop middle 0s
part1 = binary_s[:8]
part2 = binary_s[9:]
part1 = hex(int("".join([str(i) for i in part1]), 2))
part2 = hex(int("".join([str(i) for i in part2]), 2))
print "part 1", part1  # like "part 1 0xeb"
print "part 2", part2  # like "part 2 0xd0"
