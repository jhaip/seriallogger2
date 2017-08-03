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
const int HALFTONE_DIM_LEVEL = 2;
const int DIM_LEVEL = 4;

char color_levels[6] = {0, 0, 0, 0, 0, 0};

// Set the argument to the NUMBER of pixels.
Adafruit_WS2801 strip = Adafruit_WS2801(numPixel);

boolean commonAnode = false;
char szInfo[128];
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);

struct RGB
{
	unsigned char R;
	unsigned char G;
	unsigned char B;
};

struct HSV
{
	double H;
	double S;
	double V;
};

static double Min(double a, double b) {
	return a <= b ? a : b;
}

static double Max(double a, double b) {
	return a >= b ? a : b;
}

struct HSV RGBToHSV(struct RGB rgb) {
	double delta, min;
	double h = 0, s, v;

	min = Min(Min(rgb.R, rgb.G), rgb.B);
	v = Max(Max(rgb.R, rgb.G), rgb.B);
	delta = v - min;

	if (v == 0.0)
		s = 0;
	else
		s = delta / v;

	if (s == 0)
		h = 0.0;

	else
	{
		if (rgb.R == v)
			h = (rgb.G - rgb.B) / delta;
		else if (rgb.G == v)
			h = 2 + (rgb.B - rgb.R) / delta;
		else if (rgb.B == v)
			h = 4 + (rgb.R - rgb.G) / delta;

		h *= 60;

		if (h < 0.0)
			h = h + 360;
	}

	struct HSV hsv;
	hsv.H = h;
	hsv.S = s;
	hsv.V = v / 255;

	return hsv;
}

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
    if (color_levels[COLOR_VIOLET_INDEX] > 0 &&
        color_levels[COLOR_BLUE_INDEX] > 0 &&
        color_levels[COLOR_GREEN_INDEX] > 0 &&
        color_levels[COLOR_YELLOW_INDEX] > 0 &&
        color_levels[COLOR_ORANGE_INDEX] > 0 &&
        color_levels[COLOR_RED_INDEX] > 0)
    {
        // flash a few times to signal the game has been won
        delay(300);
        int i;
        for (i=0; i < 6; i++) {
            strip.setPixelColor(i, 100, 100, 100);
        }
        strip.show();
        delay(100);
        for (i=0; i < 6; i++) {
            strip.setPixelColor(i, 0, 0, 0);
        }
        strip.show();
        delay(100);
        for (i=0; i < 6; i++) {
            strip.setPixelColor(i, 100, 100, 100);
        }
        strip.show();
        delay(100);
        for (i=0; i < 6; i++) {
            strip.setPixelColor(i, 0, 0, 0);
        }
        strip.show();
        delay(100);
        for (i=0; i < 6; i++) {
            strip.setPixelColor(i, 100, 100, 100);
        }
        strip.show();
        delay(100);
        for (i=0; i < 6; i++) {
            strip.setPixelColor(i, 0, 0, 0);
        }
        strip.show();
        delay(100);
        reset_colors();
    }
}

void sense_colors() {
    uint16_t clear, red, green, blue;

    tcs.setInterrupt(false);      // turn on LED

    delay(60);  // takes 50ms to read

    tcs.getRawData(&red, &green, &blue, &clear);
    tcs.setInterrupt(true);  // turn off LED

    uint16_t lux = tcs.calculateLux(red, green, blue);
    uint16_t temperature = tcs.calculateColorTemperature(red, green, blue);

    // Figure out some basic hex code for visualization
    uint32_t sum = clear;
    float r, g, b;

    r = red; r /= sum;
    g = green; g /= sum;
    b = blue; b /= sum;
    r *= 255; g *= 255; b *= 255;

    struct RGB data = { (unsigned char)r, (unsigned char)g, (unsigned char)b };
    struct HSV hsv_value = RGBToHSV(data);

    int h,s,v;
    h = (int)hsv_value.H;
    s = (int)(hsv_value.S*100);
    v = (int)(hsv_value.V*100);

    sprintf(szInfo, "%d,%d,%d - %d,%d - %d,%d,%d", (int)r, (int)g, (int)b, (int)lux, (int)temperature, h, s, v);

    Spark.publish("colorinfo", szInfo);

    Serial.println(szInfo);

    if (h <= 10) {
      color_levels[COLOR_RED_INDEX] = 1;
    } else if (h <= 45) {
      color_levels[COLOR_ORANGE_INDEX] = 1;
    } else if (h <= 80) {
      color_levels[COLOR_YELLOW_INDEX] = 1;
    } else if (h <= 200) {
      color_levels[COLOR_GREEN_INDEX] = 1;
    } else if (h <= 270) {
      color_levels[COLOR_BLUE_INDEX] = 1;
    } else if (h <= 330) {
      color_levels[COLOR_VIOLET_INDEX] = 1;
    } else {
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
