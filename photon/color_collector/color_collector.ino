/* ========================== Application.cpp =========================== */

#include "application.h"
#include "WS2801.h"

/*****************************************************************************
Example sketch for driving Adafruit WS2801 pixels on the Spark Core!
  Designed specifically to work with the Adafruit RGB Pixels!
  12mm Bullet shape ----> https://www.adafruit.com/products/322
  12mm Flat shape   ----> https://www.adafruit.com/products/738
  36mm Square shape ----> https://www.adafruit.com/products/683
  These pixels use SPI to transmit the color data, and have built in
  high speed PWM drivers for 24 bit color per pixel
  2 pins are required to interface
  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!
  Written by Limor Fried/Ladyada for Adafruit Industries.
  BSD license, all text above must be included in any redistribution
*****************************************************************************/

// The colors of the wires may be totally different so
// BE SURE TO CHECK YOUR PIXELS TO SEE WHICH WIRES TO USE!

// SPARK CORE SPI PINOUTS
// http://docs.spark.io/#/firmware/communication-spi
// A5 (MOSI) Yellow wire on Adafruit Pixels
// A3 (SCK) Green wire on Adafruit Pixels

// Don't forget to connect the ground wire to Arduino ground,
// and the +5V wire to a +5V supply$

const int numPixel = 20;
const int COLOR_VIOLET_INDEX = 0;
const int COLOR_BLUE_INDEX = 1;
const int COLOR_GREEN_INDEX = 2;
const int COLOR_YELLOW_INDEX = 3;
const int COLOR_ORANGE_INDEX = 4;
const int COLOR_RED_INDEX = 5;

const int HALFTONE = 127;
const int HALFTONE_DIM_LEVEL = 25;
const int DIM_LEVEL = 50;

// Set the argument to the NUMBER of pixels.
Adafruit_WS2801 strip = Adafruit_WS2801(numPixel);

// For 36mm LED pixels: these pixels internally represent color in a
// different format.  Either of the above constructors can accept an
// optional extra parameter: WS2801_RGB is 'conventional' RGB order
// WS2801_GRB is the GRB order required by the 36mm pixels.  Other
// than this parameter, your code does not need to do anything different;
// the library will handle the format change.  Example:
//Adafruit_WS2801 strip = Adafruit_WS2801(25, WS2801_GRB);

void setup() {
    Spark.function("color", color);
    strip.begin();
    delay(50);
    reset_colors();
}

void loop() {

}

void reset_colors() {
  strip.setPixelColor(COLOR_VIOLET_INDEX, HALFTONE_DIM_LEVEL, 0, DIM_LEVEL);
  strip.setPixelColor(COLOR_BLUE_INDEX, 0, 0, DIM_LEVEL);
  strip.setPixelColor(COLOR_GREEN_INDEX, 0, DIM_LEVEL, 0);
  strip.setPixelColor(COLOR_YELLOW_INDEX, DIM_LEVEL, DIM_LEVEL, 0);
  strip.setPixelColor(COLOR_ORANGE_INDEX, DIM_LEVEL, HALFTONE_DIM_LEVEL, 0);
  strip.setPixelColor(COLOR_RED_INDEX, DIM_LEVEL, 0, 0);
  strip.show();
  delay(50);
}
