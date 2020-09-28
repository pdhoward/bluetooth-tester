const timeButton = document.getElementById('time')

// declared in device
//const log = (msg) => console.log(msg)
async function onTimeClick() {
    // try {
    //   log('Requesting any Bluetooth Device...');
    //   const device = await navigator.bluetooth.requestDevice(
    //     {filters:[{services:[ 'current_time' ]}], 
    //      // acceptAllDevices: true,
    //      optionalServices: ['next_dst_change', 'reference_time_update']});
  
    //   log('Connecting to GATT Server...');
    //   const server = await device.gatt.connect();
  
    //   log('Getting Service...');
    //   let service = await server.getPrimaryService('current_time');
        
    //   log('Getting Characteristics...');
    //   characteristics = await service.getCharacteristics();
    //   log(`Found ${characteristics.length} characteristics`) 
    //   for (const characteristic of characteristics) {
    //     log(`Exploring characteristic ${characteristic.uuid}`)
    //     switch (characteristic.uuid) {
  
    //       case BluetoothUUID.getCharacteristic('reference_time_information'):
    //         log(`Function 1 fired`)
          
    //        await characteristic.readValue().then(value => {
            
    //         log(`> Reference Time: ${value} `);
    //       }).catch(err => {
    //         log(`--------Reference Time is Null ----`)
    //         log(err)})
    //       break;
    //      //
         
    //      case BluetoothUUID.getCharacteristic('current_time'):
    //         log(`Function 2 Fired`)
    //         await characteristic.startNotifications().then(value => {
    //           log('> Time Starting: ' )
    //           console.log(time)
    //         }).catch(err => console.log(err))
    //         break;
         
    //      case BluetoothUUID.getCharacteristic('local_time_information'):
    //       log(`Function 3 Fired`)
    //       await characteristic.readValue().then(value => {
            
    //         log(`> Local Time: ${location} `);
    //       }).catch(err => {
    //         log(`--------Local Time is Null ----`)
    //         log(err)})
    //       break;
    //     }
        
    //   }
    // } catch(err) {
    //     log(err)
    // }
    try {
      log('Requesting any Bluetooth device...');
      const device = await navigator.bluetooth.requestDevice({
       // filters: [...] <- Prefer filters to save energy & show relevant devices.
          acceptAllDevices: true});
  
      log('> Requested ' + device.name);
      console.log(device)
  
      device.addEventListener('advertisementreceived', (event) => {
        log('Advertisement received.');
        log('  Device Name: ' + event.device.name);
        log('  Device ID: ' + event.device.id);
        log('  RSSI: ' + event.rssi);
        log('  TX Power: ' + event.txPower);
        log('  UUIDs: ' + event.uuids);
        event.manufacturerData.forEach((valueDataView, key) => {
          logDataView('Manufacturer', key, valueDataView);
        });
        event.serviceData.forEach((valueDataView, key) => {
          logDataView('Service', key, valueDataView);
        });
      });
  
      log('Watching advertisements from "' + device.name + '"...');
      await device.watchAdvertisements();
    } catch(error) {
      log('Argh! ' + error);
    }
  

}

/* Utils */

const logDataView = (labelOfDataSource, key, valueDataView) => {
  const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
    return b.toString(16).padStart(2, '0');
  }).join(' ');
  const textDecoder = new TextDecoder('ascii');
  const asciiString = textDecoder.decode(valueDataView.buffer);
  log(`  ${labelOfDataSource} Data: ` + key +
      '\n    (Hex) ' + hexString +
      '\n    (ASCII) ' + asciiString);
};



timeButton.addEventListener('click', onTimeClick, false);