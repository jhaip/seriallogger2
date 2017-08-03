/* ========================== Application.cpp =========================== */

#include "application.h"
#include "WS2801.h"

#include "Adafruit_TCS34725.h"
#include <math.h>

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
const int HALFTONE_DIM_LEVEL = 5;
const int DIM_LEVEL = 10;

char color_levels[6] = {0, 0, 0, 0, 0, 0};

// Set the argument to the NUMBER of pixels.
Adafruit_WS2801 strip = Adafruit_WS2801(numPixel);

boolean commonAnode = false;
char szInfo[128];
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);

void setup() {
    Serial.begin(9600);
    Serial.println("Color View Test!");

    if (tcs.begin()) {
        Serial.println("Found sensor");
    } else {
        Serial.println("No TCS34725 found ... check your connections");
        while (1); // halt!
    }

    strip.begin();
    update_colors();
}

void loop() {
  sense_colors();
  delay(1000);
}

void sense_colors() {
    uint16_t clear, red, green, blue;

    tcs.setInterrupt(false);      // turn on LED

    delay(60);  // takes 50ms to read

    tcs.getRawData(&red, &green, &blue, &clear);
    tcs.setInterrupt(true);  // turn off LED

    uint16_t lux = calculateLux(red, green, blue);
    uint16_t temperature = calculateColorTemperature(red, green, blue);

    // Figure out some basic hex code for visualization
    uint32_t sum = clear;
    float r, g, b;

    r = red; r /= sum;
    g = green; g /= sum;
    b = blue; b /= sum;
    r *= 256; g *= 256; b *= 256;

    sprintf(szInfo, "%d,%d,%d - %d,%d", (int)r, (int)g, (int)b, (int)lux, (int)temperature);

    Spark.publish("colorinfo", szInfo);

    Serial.println(szInfo);

    if (r >= HALFTONE && g < HALFTONE && b >= HALFTONE) {
      color_levels[COLOR_VIOLET_INDEX] = 1;
    }
    else if (r < HALFTONE && g < HALFTONE && b >= HALFTONE) {
      color_levels[COLOR_BLUE_INDEX] = 1;
    }
    else if (r < HALFTONE && g >= HALFTONE && b < HALFTONE) {
      color_levels[COLOR_GREEN_INDEX] = 1;
    }
    else if (r >= 200 && g >= HALFTONE && b < HALFTONE) {
      color_levels[COLOR_YELLOW_INDEX] = 1;
    }
    else if (r >= HALFTONE && g >= HALFTONE && b < HALFTONE) {
      color_levels[COLOR_ORANGE_INDEX] = 1;
    }
    else if (r >= HALFTONE && g < HALFTONE && b < HALFTONE) {
      color_levels[COLOR_RED_INDEX] = 1;
    }
    update_colors();
}

void reset_colors() {
  color_levels[COLOR_VIOLET_INDEX] = 0;
  color_levels[COLOR_BLUE_INDEX] = 0;
  color_levels[COLOR_GREEN_INDEX] = 0;
  color_levels[COLOR_YELLOW_INDEX] = 0;
  color_levels[COLOR_ORANGE_INDEX] = 0;
  color_levels[COLOR_RED_INDEX] = 0;
}

void update_colors() {
  if (color_levels[COLOR_VIOLET_INDEX] == 0) {
    strip.setPixelColor(COLOR_VIOLET_INDEX, HALFTONE_DIM_LEVEL, 0, DIM_LEVEL);
  } else {
    strip.setPixelColor(COLOR_VIOLET_INDEX, HALFTONE, 0, 255);
  }

  if (color_levels[COLOR_BLUE_INDEX] == 0) {
    strip.setPixelColor(COLOR_BLUE_INDEX, 0, 0, DIM_LEVEL);
  } else {
    strip.setPixelColor(COLOR_BLUE_INDEX, 0, 0, 255);
  }

  if (color_levels[COLOR_GREEN_INDEX] == 0) {
    strip.setPixelColor(COLOR_GREEN_INDEX, 0, DIM_LEVEL, 0);
  } else {
    strip.setPixelColor(COLOR_GREEN_INDEX, 0, 255, 0);
  }

  if (color_levels[COLOR_YELLOW_INDEX] == 0) {
    strip.setPixelColor(COLOR_YELLOW_INDEX, DIM_LEVEL, DIM_LEVEL, 0);
  } else {
    strip.setPixelColor(COLOR_YELLOW_INDEX, 255, 255, 0);
  }

  if (color_levels[COLOR_ORANGE_INDEX] == 0) {
    strip.setPixelColor(COLOR_ORANGE_INDEX, DIM_LEVEL, HALFTONE_DIM_LEVEL, 0);
  } else {
    strip.setPixelColor(COLOR_ORANGE_INDEX, 255, HALFTONE, 0);
  }

  if (color_levels[COLOR_RED_INDEX] == 0) {
    strip.setPixelColor(COLOR_RED_INDEX, DIM_LEVEL, 0, 0);
  } else {
    strip.setPixelColor(COLOR_RED_INDEX, 255, 0, 0);
  }
  strip.show();
  delay(50);
}
