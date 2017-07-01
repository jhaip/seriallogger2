// This #include statement was automatically added by the Particle IDE.
#include "IRremote.h"
// #include "IRremoteInt.h"

#include "Particle.h"


int RECV_PIN = D0;

IRrecv irrecv(RECV_PIN);
IRsend irsend;

char str[30];

decode_results results;

int sendProjectorSignal(String arg);
int sendAirConditionerSignal(String arg);

void setup()
{
  Serial.begin(9600);
  Serial.println("starting up");
  // irrecv.enableIRIn(); // Start the receiver
  Particle.function("signalproj", sendProjectorSignal);
  Particle.function("signalac", sendAirConditionerSignal);
}

int sendProjectorSignal(String arg) {
    unsigned long data = (unsigned long)strtoul(arg, NULL, 16);
    Serial.println(data);
    irsend.sendNEC(data, 32);
    return 0;
}

int sendAirConditionerSignal(String arg) {
    unsigned long data = (unsigned long)strtoul(arg, NULL, 16);
    irsend.sendHaipAC(data, 16);
    return 0;
}

void loop() {
//   if (irrecv.decode(&results)) {
//     Serial.println(results.value, HEX);
//     Serial.println(results.decode_type);
//     Serial.println(results.panasonicAddress);
//     Serial.println(results.bits);
//     //Serial.println(results.rawbuf);
//     Serial.println(">>> start rawbuf");
//     // unsigned int b[sizeof (results.rawbuf)];
//     int i;
//     for (i=0;i < results.rawlen;i++) {
//         //sprintf(str,"%d",results.rawbuf[i]);
//         //Serial.println(str);
//         Serial.print(results.rawbuf[i]);
//         Serial.print(" ");
//     }
//     Serial.println("<<< end rawbuf");
//     Serial.println(results.rawlen);
//     irrecv.resume(); // Receive the next value
//   }
    // irsend.sendNEC(0x4CB340BF, 32); // projector on

    // delay(2000);

    // irsend.sendHaipAC(0xEBD00000, 16); // ac power toggle

    // delay(2000);

    // irsend.sendNEC(0x4CB3748B, 32); // projector off

    // delay(2000);

    // irsend.sendHaipAC(0xEBD00000, 16); // ac power toggle

    delay(2000);
}
