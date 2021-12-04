# phone-book-demo

# How to install & run the project:

Install docker & run `docker-compose up` in the project directory

# How to use the service

## Authentication

Every user has to first register himself/herself at **POST** /signup:

- body form expected:

```json
{
  "name": "the user name",
  "surname": "the user surname",
  "password": "the user password"
}
```

- response:

```json

{
  "userId": "61ab4390b50d58275a855747"
}
```

This user id has to be used in the login procedure at **POST** /login

```json
{
  "userId": "the user id returned in registration phase",
  "password": "the user password"
}
```

- response:

```json
{
  "token": "the jwt token to be used to authenticate the requests"
}
```

#### Every request has to be authenticated & authorized sending, along the request, the header "x-auth" with the received token.

## Available services:

Available endpoints of the service:

- **POST** /contacts: save a contact for the *authenticated* user. Expected json body as follows:

```json

{
  "name": "contact name, required",
  "surname": "contact surname, optional",
  "phoneNumbers": [
    {
      "number": "phone number, required for every number in the list",
      "numberType": "the number type (mobile, work, home etc..). Optional. Default is 'Other'"
    },
    {
      "number": "The list can also be empty, but an empty array has to be sent."
    }
  ],
  "email": "An email. Optional",
  "address": "An address. Optional"
}
```

Response :

```json
{
  "contactId": "61ab43d5b50d58275a85574c"
}
```

- **GET** /contacts/{contactId}: Get the contact with the given id, if belonging to the *authenticated* user.
- **GET** /contacts *?size=2&page=0&sorted=desc&sortedKey=name*: Get all the contacts belonging to the *authenticated*
  user, pagined as required. Every pagined parameter is optional.
    - size: the page size. Default 10
    - page: the page number. Default 0
    - sortedKey: the contact property to sort on. Default *no sort*
    - sorted: asc or desc, the sort direction. Default asc if *sortedKey* is supplied.

Response:

```json
    {
  "page": 0,
  "size": 1,
  "sortedKey": "name",
  "sorted": "asc",
  "content": [
    {
      "_id": "61ab43d5b50d58275a85574c",
      "userOwnerId": "61ab4390b50d58275a855747",
      "name": "ccccc",
      "phoneNumbers": [
        {
          "number": "00",
          "numberType": "Other",
          "_id": "61ab43d5b50d58275a85574d"
        }
      ],
      "__v": 0
    }
  ]
}
```

- **DELETE** /contacts/{contactId}: Deletes the contact with the given id, if belonging to the *authenticated* user. The
  deleted contact is returned.
- **PATCH** /contacts/{contactId}: Patch (partial update) the contact with the given id, if belonging to the
  *authenticated* user. Expects a body in the same form as the POST method, with every field optional. Every not null
  field will replace the existing contact field with the same name. As of `phoneNumbers`, if a new one is present in the
  request, it will be added to the ones already existing in the contact. If one which already exists is sent, it will
  replace the associated numberType (in this case, this field is mandatory). The updated version of the contact is
  returned.
- **PUT** /contacts/{contactId}: Completely overrides the existing contact with the given id, if belonging to the
  *authenticated* user. Expects a body in the same form as the POST method. The updated version of the contact is
  returned.

## How to run the tests

In order to run the tests, please modify the database url in the `.env` file, using a working instance of mongo. The
reason is explained in trade-off. Then, in the directory of the project, run `npm test`.

## Why non relational database?

In order to allow the users having multiple phone numbers per contact and avoiding a join-table, a non-relational
database (in particular mongo db) was chosen.

## Trade-offs

Test suffers from non modularity, code & flow repetition and, more than any other, can be run only with a working
database instance in place. A mocking version of mongoose has been prepared (mockgoose) but it suffers from high delays
and leads the tests failing. With more time I would for sure refactor the tests, bringing together common execution
flows, avoiding call-back hell and finding a way to run the mongo instance in memory.

