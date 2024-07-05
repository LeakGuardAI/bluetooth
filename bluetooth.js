
let bluetoothDevice;
let server;
let networks;

// Characteristics
let networksChar;
let ssidChar;
let passChar;
let statusChar;

const networksSelect = document.getElementById("networks");

const requestDevice = async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["6e400001-b5a0-f393-e0a9-e50e24dcca9e"]
        });
        return device;
    } catch (error) {
        console.error(error);
    }
}

const connectToDevice = async () => {
    try {
        server = await bluetoothDevice?.gatt?.connect();
        const service = await server?.getPrimaryService("6e400001-b5a0-f393-e0a9-e50e24dcca9e");

        networksChar = await service?.getCharacteristic("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
        
        ssidChar = await service?.getCharacteristic("6e400001-b5a1-f393-e0a9-e50e24dcca9e");
        passChar = await service?.getCharacteristic("6e400001-b5a2-f393-e0a9-e50e24dcca9e");
        statusChar = await service?.getCharacteristic("6e400001-b5a3-f394-e0a9-e50e24dcca9e");

        

        // const WIFI_SSID_CHARACTERISTIC = await service.getCharacteristic("6e400001-b5a1-f393-e0a9-e50e24dcca9e"); // Write
        // const WIFI_PASS_CHARACTERISTIC = await service.getCharacteristic("6e400001-b5a2-f393-e0a9-e50e24dcca9e"); // Write
        // const DEVICE_UID = await service.getCharacteristic(); // Read
        // const WIFI_NETWORKS_CHARACTERISTIC = await service.getCharacteristic("6e400001-b5a3-f393-e0a9-e50e24dcca9e"); // Read
        // const WIFI_CONNECTION_STATUS_CHARACTERISTIC = await service.getCharacteristic("6e400001-b5a4-f393-e0a9-e50e24dcca9e"); // Read

    } catch (error) {
        throw new Error(error);
    }
}

const requestAvailableNetworks = async () => {
    try {
        networksChar?.addEventListener("characteristicvaluechanged", (event) => {
            const wifiNetworks = uint8ArrayToString(event.target.value);
            networks = wifiNetworks.split(" ");
        });

        await networksChar?.startNotifications();
    } catch (error) {
        throw new Error(error);
    }
}

function displayNetworks() {
    networksSelect.innerHTML = "";
    networks.forEach(network => {
        let option = document.createElement("option");
        option.value = option.innerText = network;
        networksSelect.appendChild(option);
    })
}

function sendWifiCredentials() {
    const ssid = document.getElementById("networks").value;
    const pass = document.getElementById("password").value;
    console.info("Connecting Raspberry PI to Wifi with credentials:")
    console.info(`SSID: ${ssid}`);
    console.info(`PASS: ${pass}`);

    ssidChar?.writeValueWithResponse(ssid)
        .then(response => console.log('Data written successfully', response))
        .catch(error => console.error('Error writing data', error));

    passChar?.writeValueWithResponse(pass)
        .then(response => console.log('Data written successfully', response))
        .catch(error => console.error('Error writing data', error));
}

async function addDevice() {
    

    try {
        bluetoothDevice = await requestDevice();

        await connectToDevice();
        await requestAvailableNetworks();
    } catch (e) {
        console.log(e)
        // For testing
        networks = [
            '1',
            '2',
            '3',
            '4'
        ]
    }

    

    if (networks != null) {
        displayNetworks();
    }
}