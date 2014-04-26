/**
 *                                       888
 *                                       888
 *                                       888
 *   .d8888b  88888b.   .d88b.   .d88b.  888  888 888  888
 *   88K      888 "88b d8P  Y8b d8P  Y8b 888 .88P 888  888
 *   "Y8888b. 888  888 88888888 88888888 888888K  888  888
 *        X88 888  888 Y8b.     Y8b.     888 "88b Y88b 888
 *    88888P' 888  888  "Y8888   "Y8888  888  888  "Y88888
 *                                                    888
 *                           by cyrilf           Y8b d88P
 *                                               "Y88P"
 */

'use strict';

var sneeky = require('./server');

sneeky.configure({
  name: 'sneeky',
  port: process.env.PORT || 2377
});

sneeky.start();
