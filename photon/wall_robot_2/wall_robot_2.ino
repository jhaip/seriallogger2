int servoPin = D0;
Servo myServo;
int servoPos = 0;

void setup() {
    myServo.attach(servoPin);
    myServo.write(67);
    Serial.begin(9600);
}

void loop() {
  /*int val = analogRead(A0);
  Serial.println(val);
  delay(1000);*/

  myServo.write(67+10);
  delay(2000); // move forward more than backward
  myServo.write(67-10);
  delay(1000);
}
