# UDPmft

UDPmft stands for UDP Multicast File Transfer. It provides a server and a client to share files between one server and many clients using multicast.

---

## How to configure it

### Server side

- Get the network interface where the server should listen and put its name in server/config.json.

```JSON
{
	"INTERFACE": "lo"
}
```

- Get the port which the server should listen to and put it in server/config.json.

```JSON
{
	"INTERFACE": "lo",
	"PORT": 20000
}
```

- Get the multicast address where the files have to be transfered.

```JSON
{
	"INTERFACE": "lo",
	"PORT": 20000,
	"MULTICAST_ADDR": "233.255.255.255"
}
```

- Choose a delay depending on your network speed. Don't forget that the server send data by 32kB segment via UDP so your network have to be able to support the given delay. For example, a delay of 10ms need a network speed a little bit more than **32 kB / 10 ms = 3,2 Mo/s**.

```JSON
{
	"INTERFACE": "lo",
	"PORT": 20000,
	"MULTICAST_ADDR": "233.255.255.255",
	"DELAY": 10
}
```

### Client side

- Get the network interface where the client should listen and put its name in client/config.json.

```JSON
{
	"INTERFACE": "lo"
}
```

- Get the port which the client should listen to and put it in client/config.json.

```JSON
{
	"INTERFACE": "lo",
	"PORT": 20000
}
```

- Get the multicast address where the files have to be received.

```JSON
{
	"INTERFACE": "lo",
	"PORT": 20000,
	"MULTICAST_ADDR": "233.255.255.255"
}
```

### WARNING

The server's and client's port have to be the same for the moment ! I don't patch this feature now for better development environment.

---

## How to use it

### Build

First, you need to install the dependancies and build the server and the client.

```bash
npm install
npm run build
```

These commands create a new folder called "./build" with two subfolders:

- one named "./build/server"
- a second one named "./build/client"

Then, export these subfolders into your server and clients.

### File transfer

The firsts scripts to run are the client scripts. The only argument to give is the location of the folder where the file will be uploaded.

```bash
npm run start-client ./
```

or

```bash
node build/client/client.js
```

Then, the second script to run is the server one, with the path to the file you want to transfer and the number of machine which are supposed to receive this file in argument. By default, the second argument is "1".

```bash
npm run start-server /path/to/file 2
```

or

```bash
node build/server/server.js /path/to/file 2
```

For the moment, files with space in their name are not correctly sent. For example, the file "/home/source/test and test.txt" is would be transfered in another directory like /home/destination/test. Just the first word is kept.
