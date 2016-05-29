#!/bin/bash

mkdir /symbols
cd /symbols

mips-linux-gnu-gcc -mips32r5 -g -c /import/src/* 1>&2

if [ "`ls -1 *.o 2> /dev/null | wc -l`" -eq 0 ]; then
	printf "Could not find object files\n" 1>&2
	exit 3
fi

symbols=""
for objectFile in `echo *.o`; do
	file="`echo $objectFile | sed 's/\.o$//'`"

	nmOutput="$(nm -f b -l --defined-only $objectFile)"

	while read line; do
		    type="`echo $line | awk -F " " '{print $2}'`"
		    name="`echo $line | awk -F " " '{print $3}'`"
		location="`echo $line | awk -F " " '{print $4}'`"

		if [ "$location" = "" ]; then
			location="${file}.s"
		fi

		symbols="${symbols}${name} ${location} ${type}
"
	done <<< "$nmOutput"
done

symbols="`printf "$symbols"`"


linkedNmOutput="$(nm -f b -l --defined-only /out/proj.out)"
lastLine="`printf "$symbols" | tail -1`"
printf '[\n'
while read line; do
	    name="`echo $line | awk -F " " '{print $1}'`"
	location="`echo $line | awk -F " " '{print $2}'`"
	    type="`echo $line | awk -F " " '{print $3}'`"

	linkedLine="`echo "$linkedNmOutput" | grep -E "\\s$name\\s"`"

		    address="`echo $linkedLine | awk -F " " '{print $1}'`"
	    linked_type="`echo $linkedLine | awk -F " " '{print $2}'`"

	   	if [ "$linked_type" != "" ]; then
	   		type="$linked_type"
		fi

 	cat <<EOF
{"address":"${address}","name":"${name}","location":"${location}","type":"${type}"}
EOF

    if [ "$lastLine" != "$line" ]; then
    	printf ","
    else
    	printf ""
	fi

done <<< "$symbols"
printf '\n]'
