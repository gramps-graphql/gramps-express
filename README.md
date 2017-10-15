# GrAMPS · [![npm version](https://img.shields.io/npm/v/@gramps/gramps-express.svg?style=flat)](https://www.npmjs.com/package/@gramps/gramps-express) [![Build Status](https://travis-ci.org/gramps-graphql/gramps-express.svg?branch=master)](https://travis-ci.org/gramps-graphql/gramps-express) [![Maintainability](https://api.codeclimate.com/v1/badges/ac264833fac1fbd1afe0/maintainability)](https://codeclimate.com/github/gramps-graphql/gramps-express/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/ac264833fac1fbd1afe0/test_coverage)](https://codeclimate.com/github/gramps-graphql/gramps-express/test_coverage) [![Greenkeeper badge](https://badges.greenkeeper.io/gramps-graphql/gramps-express.svg)](https://greenkeeper.io/)

**Gr**aphQL **A**pollo **M**icroservice **P**attern **S**erver

An easier way to manage the data sources powering your GraphQL server.

GrAMPS is middleware designed for [apollo-server-express](https://git.io/vd1wc)
that allows data sources — a schema, resolvers, and data access model — to be 
composed into a single GraphQL schema, while keeping the code within each data 
source isolated, independently testable, and completely decoupled from the rest 
of your application.

## Developer Quickstart

TKTK

## What GrAMPS Can Do

 -  Combine distinct schemas into a single GraphQL schema
 -  Allow local development with optional local overrides of data sources
 -  Improve error reporting with optional error handling

### Development
1.  Import each GrAMPS data source as an npm package
2.  Check for local data sources specified in `GQL_DATA_SOURCES` or in the 
    `--data-source-dir` argument to the CLI command `gramps`
3.  Merge all GrAMPS data sources into a single GraphQL schema
4.  Attach the combined schema and context to the Express request
5.  Use the GrAMPS schema and context in `graphqlExpress` to start the server
