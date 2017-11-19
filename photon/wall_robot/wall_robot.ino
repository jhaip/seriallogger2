
void callback(char* topic, byte* payload, unsigned int length);

void callback(char* topic, byte* payload, unsigned int length) {
    char p[length + 1];
    memcpy(p, payload, length);
    p[length] = NULL;
    String message(p);
    delay(1000);
}

int tick = 0;
int loopCount = 0;
int loops = 30;
char msg[100];

int servoPin = D0;
Servo myServo;
int servoPos = 0;

int servoControl(String command)
{
    // Convert
   int newPos = command.toInt();
   // Make sure it is in the right range
   // And set the position
   servoPos = constrain( newPos, 0 , 180);

   // Set the servo
   myServo.write( servoPos );

   // done
   return 1;
}

void digitalWriteMQTT(int port, int value) {
  digitalWrite(port, value);
  delay(10);
  sprintf(msg, "{\"type\": \"BINARY\", \"label\": \"D%d\", \"value\": %d, \"tick\": \"%lu\"}", port, value, millis());
  // client.publish("/outTopic", msg);
}
int analogReadMQTT(int port) {
  delay(10);
  int value = analogRead(A0);    // read the input pin
  sprintf(msg, "{\"type\": \"BINARY\", \"label\": \"A0\", \"value\": %d, \"tick\": \"%lu\"}", value, millis());
  Serial.println(value);
  // client.publish("/outTopic", msg);
  return value;
}


void setup() {
    myServo.attach(servoPin);
    myServo.write(67);
    Serial.begin(9600);
}

void loop() {
    ++loopCount;
    sprintf(msg, "{\"type\": \"BREAK\", \"label\": \"LOOP\", \"value\": %d, \"tick\": \"%lu\"}", loopCount, millis());
    // client.publish("/outTopic", msg);

    int val = analogReadMQTT(A0);
    delay(100);

    // client.loop();

    if (loopCount % 5 == 0) {
        int goal = 2300;
        int error = val-goal;
        error = error / 20;

        // introduce some error to cause oscillations
        if (error <= 0 && error > -10) {
            error = -10;
        }
        if (error >= 0 && error < 10) {
            error = 10;
        }

        if (error < -40) {
            error = -40;
        }
        if (error > 40) {
            error = 40;
        }
        myServo.write(67+error);
    }
}
