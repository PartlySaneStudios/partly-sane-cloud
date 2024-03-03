# partly-sane-cloud

<!-- Jan made me do this -->

## Setup 

### ``.env``
Copy this into your ``.env`` file

```
DATABASE_URL="mysql://(USER):(PASSWORD)@localhost:3306/(DATABASENAME)"
HYPIXEL_API_KEY=""

CLEAR_CACHE_KEY=""
SSL_KEY=""
SSL_CERT=""
```


#### MySQL database

You must set up a MySQL database in order to use Prisma. <!-- Honestly I am not qualified to talk about this -->]

When you have completed the MySQL set up, replace the ``DATABASE_URL`` field in your ``.env`` file with ``mysql://(USER):(PASSWORD)@localhost:3306/(DATABASENAME)``, replacing ``(USER)`` with your username, ``(PASSWORD)`` with your password, and ``(DATABASENAME)`` with your database. You can also replace ``localhost:3306`` with the correct database address if you are not using ``localhost`` with the default port.

#### Hypixel API

To use the Hypixel API you must get an API key. Head to https://developer.hypixel.net/dashboard and create a development key. Set you development key as ``HYPIXEL_API_KEY`` in your ``.env`` file.

#### Clear Cache Key

Partly Sane Cloud caches the public data in a prisma model. In order to clear it, you must send a get request to the ``/v1/pss/middlemanagement/clearpublicdata?key=`` with a key that matches the ``CLEAR_CACHE_KEY`` value in the ``.env`` file. This key can be whatever you would like.


#### SSL Certificates (Optional)

If you would like to use HTTPS, you must have SSL certificates. Whenever you have your certificates, set your the path to your SSL private key as ``SSL_KEY``, and the path to your SSL certificate as ``SSL_CERT`` in the ``.env`` file.

## Node

### npm

Once you have set up your ``.env`` file, run ``npm install`` to install all packages required.

### Prisma

After all packages have been installed, run ``npx prisma migrate dev`` to migrate your ``schema.prisma`` file to the database (Make sure you have a valid database url).

### Run

To start the server, you can run either ``npm run dev`` (does not work rn), ``npm run deploy`` (only do this for servers), ``tsc && node ./dist/index.js``, or ``ts-node ./src/index.ts``
