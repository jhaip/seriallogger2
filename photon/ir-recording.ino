// This #include statement was automatically added by the Particle IDE.
#include "IRremote.h"
// #include "IRremoteInt.h"

#include "Particle.h"


int RECV_PIN = D0;

IRrecv irrecv(RECV_PIN);
IRsend irsend;

char str[30];

decode_results results;

void setup()
{
  Serial.begin(9600);
  Serial.println("starting up");
  irrecv.enableIRIn(); // Start the receiver
}

void loop() {
  if (irrecv.decode(&results)) {
    Serial.println(results.value, HEX);
    Serial.println(results.decode_type);
    Serial.println(results.panasonicAddress);
    Serial.println(results.bits);
    //Serial.println(results.rawbuf);
    Serial.println(">>> start rawbuf");
    // unsigned int b[sizeof (results.rawbuf)];
    int i;
    for (i=0;i < results.rawlen;i++) {
        //sprintf(str,"%d",results.rawbuf[i]);
        //Serial.println(str);
        Serial.print(results.rawbuf[i]);
        Serial.print(" ");
    }
    Serial.println("<<< end rawbuf");
    Serial.println(results.rawlen);
    irrecv.resume(); // Receive the next value
  }
}
