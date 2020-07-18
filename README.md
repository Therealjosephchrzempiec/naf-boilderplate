# NAF Boilerplate

\_\_

What y'all have to do to run it locally ...
First clone this bad boy from GitHub

git clone git@github.com:EricEisaman/naf-boilerplate.git

Move into the naf-boilerplate directory ...

cd naf-boilerplate

Create a .env wit y'all ADMIN_KEY ...

echo 'ADMIN_KEY=password' > .env

Create an empty JSON object in .data directory for y'all database ...

echo '{}' > .data/db.json

Install da dependencies ...

npm install

Start the puppy ...

node server
