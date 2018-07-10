Getting Started
---------------

```sh
# clone it
git clone git@github.com:ammoradi/lexyn.git
cd lexyn

# Install dependencies
brew install python@3 node
npm install
pip3 install ply
chmod a+x src/services/lexyn/lexyn.js

# Start development live-reload server
PORT=8080 npm run dev

# Start production server:
PORT=8080 npm start
```
