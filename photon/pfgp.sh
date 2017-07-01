#!/bin/bash

# pfgp "particle flash & git push"
# pfgp PHOTON-IDENTIFIED FIRMWARE-FILE
# example usage:
#    pfgp turkey_laser ir_recording
#    pfgp turkey_laser blink.ino

pfgp(){
	particle flash $1 $2
	git add $2
	git commit -m "Photon firmware flash of $2"
	git push
}
