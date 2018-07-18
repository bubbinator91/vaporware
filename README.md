# Vaporware

##### An automated front-end and REST API for controlling popular IR desktop vaporizers via LIRC, written in NodeJS and Express.

## Requirements

* Supported vaporizer

* Linux server with:

  * IR transmitter supported by LIRC

  * LIRC

  * MySQL or MariaDB

  * NodeJS

## Installation

1. `npm install vaporware-ir` on your LIRC server.

2. Execute `vaporware.sql` within your MySQL or MariaDB instance to create the Vaporware database.

3. Place `lircd.conf` in `/etc/lirc`

4. Rename `config-example.json` to `config.json` and adjust as needed.

5. (Optional) For Homebridge support, install the `homebridge-http` plugin and add the contents of `homebridge-config-accessories.json` to your Homebridge `config.json`.

6. Execute `node index.js` and navigate your web browser to (by default) `http://<server_name>:4200`

## Usage

* Press `Vape` to turn on the vaporizer, heat the contents to the specified temperature, and start and stop the fan automatically. If the vaporizer was already on, then this will only start and stop the fan automatically.

* Press `Last Bag` to do the same thing as the `Vape` button, and turn the vaporizer off when finished.

* Press `Cleaning` to reset the number of bags filled since the last time the device was cleaned.

* Use the `Override` menu if Vaporware and your vaporizer become out-of-sync.

* Use the status indicators at the top to change settings ad-hoc. Some of these may only be used while the vaporizer is in certain states.

* While the bag is filling, use the `+N seconds` and `Stop Early` buttons to modify how long the bag fills for. Vaporware will adjust future bags accordingly.
