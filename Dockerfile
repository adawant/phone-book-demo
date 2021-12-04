FROM node

LABEL it.adawant.maintainer="andrei_aldo1996@yahoo.it"
LABEL it.polito.demo.adawant.phonebook.version="0.0.1-SNAPSHOT"
LABEL it.polito.demo.adawant.phonebook.description="Phonebook demo service"

COPY . /home/adawant/demo/phonebook/src
WORKDIR /home/adawant/demo/phonebook/src
RUN npm install #; npm test
CMD npm start




