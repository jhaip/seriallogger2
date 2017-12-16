int servoPin = D0;
Servo myServo;
int servoPos = 0;

void setup() {
    myServo.attach(servoPin);
    myServo.write(67);
    Serial.begin(9600);
}

void loop() {
  delay(200);
  int goal = 2500;
  int val = analogRead(A0);
  int error = val-goal;
  error = error / 20;
  Serial.println(error);

  myServo.write(67+error);
  /*myServo.write(67+10); // backwards
  delay(2000); // move forward more than backward
  myServo.write(67-10); // forwards
  delay(1000);*/
}
