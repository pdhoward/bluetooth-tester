const heartButton = document.getElementById('heart')

const log = (msg) => console.log(msg)
async function onHeartClick() {
    try {
      log('Requesting any Bluetooth Device...');
      const device = await navigator.bluetooth.requestDevice(
        {filters:[{services:[ 'heart_rate' ]}], 
         // acceptAllDevices: true,
         optionalServices: ['device_information']});
  
      log('Connecting to GATT Server...');
      const server = await device.gatt.connect();
  
      log('Getting Device Information Service...');
      let service = await server.getPrimaryService('device_information');
      log(`-------------------------------------`)
      log('Getting Heart Rate Service...');
      service = await server.getPrimaryService('heart_rate');
  
      log('Getting Heart Rate Characteristics...');
      characteristics = await service.getCharacteristics();
      log(`Found ${characteristics.length} characteristics`) 
      for (const characteristic of characteristics) {
        log(`Exploring Heart Rate characteristic ${characteristic.uuid}`)
        switch (characteristic.uuid) {
  
          case BluetoothUUID.getCharacteristic('heart_rate_control_point'):
            log(`this fired heart rate control`)
            let number = 5
            let hex = number.toString()
            // allocate buffer in memory for 16 bytes
            let buffer = new ArrayBuffer(16);
            let view = new Uint32Array(buffer)  // buffer is a seq of 32 bit integers, or 4 bytes
            view[0] = hex
            await characteristic.writeValue(view).then(value => {
              
              log(`> Heart Rate Control Point Updated`);
            });
            break;
         //
         case BluetoothUUID.getCharacteristic('body_sensor_location'):
            log(`this fired locate`)
            await characteristic.readValue().then(value => {
              let location = getBodySensorLocation(value)
              log(`> Body Sensor Location: ${location} `);
            });
            break;
         //
         case BluetoothUUID.getCharacteristic('heart_rate_measurement'):
            log(`this fired heart rate`)
            await characteristic.startNotifications().then(value => {
              log('> Heart Rate Measurement Starting: ' )
              handleHeartRateMeasurement(value)
            });
            break;
        }
      }
    } catch(err) {
        log(err)
    }
}

heartButton.addEventListener('click', onHeartClick, false);