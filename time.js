const timeButton = document.getElementById('time')

// declared in device
//const log = (msg) => console.log(msg)
async function onTimeClick() {
    try {
      log('Requesting any Bluetooth Device...');
      const device = await navigator.bluetooth.requestDevice(
        {filters:[{services:[ 'current_time' ]}], 
         // acceptAllDevices: true,
         optionalServices: ['next_dst_change', 'reference_time_update']});
  
      log('Connecting to GATT Server...');
      const server = await device.gatt.connect();
  
      log('Getting Service...');
      let service = await server.getPrimaryService('current_time');
        
      log('Getting Characteristics...');
      characteristics = await service.getCharacteristics();
      log(`Found ${characteristics.length} characteristics`) 
      for (const characteristic of characteristics) {
        log(`Exploring characteristic ${characteristic.uuid}`)
        switch (characteristic.uuid) {
  
          case BluetoothUUID.getCharacteristic('reference_time_information'):
            log(`Function 1 fired`)

            /*
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
            */
           await characteristic.readValue().then(value => {
            
            log(`> Reference Time: ${value} `);
          }).catch(err => {
            log(`--------Reference Time is Null ----`)
            log(err)})
          break;
         //
         
        //  case BluetoothUUID.getCharacteristic('current_time'):
        //     log(`Function 2 Fired`)
        //     await characteristic.startNotifications().then(value => {
        //       log('> Time Starting: ' )
        //       console.log(time)
        //     }).catch(err => console.log(err))
        //     break;
         
         case BluetoothUUID.getCharacteristic('local_time_information'):
          log(`Function 3 Fired`)
          await characteristic.readValue().then(value => {
            
            log(`> Local Time: ${location} `);
          }).catch(err => {
            log(`--------Local Time is Null ----`)
            log(err)})
          break;
        }
        
      }
    } catch(err) {
        log(err)
    }
}



timeButton.addEventListener('click', onTimeClick, false);