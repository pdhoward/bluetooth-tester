const heartButton = document.getElementById('heartrate')

// declared in device
//const log = (msg) => console.log(msg)
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
            }).catch(err => {
              log(`--------Locate Test Data is Null ----`)
              log(err)})
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

////////////////heart sensor functions////////////////
function handleHeartRateMeasurement(heartRateMeasurement) {
  heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
    var heartRateMeasurement = parseHeartRate(event.target.value);
    log(`Heart rate just changed to ${heartRateMeasurement.heartRate}`)
    
  });
}

function parseHeartRate(value) {
  // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
  value = value.buffer ? value : new DataView(value);
  let flags = value.getUint8(0);
  let rate16Bits = flags & 0x1;
  let result = {};
  let index = 1;
  if (rate16Bits) {
    result.heartRate = value.getUint16(index, /*littleEndian=*/true);
    index += 2;
  } else {
    result.heartRate = value.getUint8(index);
    index += 1;
  }
  let contactDetected = flags & 0x2;
  let contactSensorPresent = flags & 0x4;
  if (contactSensorPresent) {
    result.contactDetected = !!contactDetected;
  }
  let energyPresent = flags & 0x8;
  if (energyPresent) {
    result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
    index += 2;
  }
  let rrIntervalPresent = flags & 0x10;
  if (rrIntervalPresent) {
    let rrIntervals = [];
    for (; index + 1 < value.byteLength; index += 2) {
      rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
    }
    result.rrIntervals = rrIntervals;
  }
  return result;
}
function getBodySensorLocation(value) {
    let data = value.buffer ? value : new DataView(value);
 
    let sensorLocation = data.getUint8(0);
    log(`Data in sensor location = ${data}`)
    switch (sensorLocation) {
      case 0: return 'Other';
      case 1: return 'Chest';
      case 2: return 'Wrist';
      case 3: return 'Finger';
      case 4: return 'Hand';
      case 5: return 'Ear Lobe';
      case 6: return 'Foot';
      default: return 'Unknown';
    
 }
}

heartButton.addEventListener('click', onHeartClick, false);