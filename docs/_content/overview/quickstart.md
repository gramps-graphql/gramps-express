---
title: "Quickstart: 5 Minutes to Glory"
weight: 1
---

Get your first GrAMPS-powered GraphQL server up and running in just a few minutes by following these steps.

## Table of Contents
{:.no_toc}

- 
{:toc}

## Step 1: Install Dependencies

```sh
# Add dependencies
yarn add express apollo-server-express body-parser graphql graphql-tools

# Add dev-only dependencies
yarn add --dev nodemon babel-cli babel-plugin-inline-import babel-preset-env
```

## Step 2: Install a GrAMPS and a Data Source

```sh
yarn add @gramps/gramps-express @gramps/data-source-xkcd
```

## Step 3: Set Up an Express App

Create a new file called `index.js` and add the following:

```js
import Express from 'express';

const app = new Express();
```

## Step 4: Set Up the Body Parser

```diff
  import Express from 'express';
+ import bodyParser from 'body-parser';

  const app = new Express();

+ app.use(bodyParser.json());
```

## Step 5: Import the GrAMPS Data Source

```diff
  import Express from 'express';
  import bodyParser from 'body-parser';
+ import gramps from '@gramps/gramps-express';

+ // Data sources
+ import XKCD from '@gramps/data-source-xkcd';

  const app = new Express();

  app.use(bodyParser.json());
+ app.use(gramps({
+   dataSources: [XKCD],
+ }));
```

## Step 6: Set Up a GraphQL Endpoint

```diff
  import Express from 'express';
  import bodyParser from 'body-parser';
  import gramps from '@gramps/gramps-express';
+ import { graphqlExpress } from '@gramps/gramps-express';

  // Data sources
  import XKCD from '@gramps/data-source-xkcd';

  const app = new Express();

  app.use(bodyParser.json());
  app.use(gramps({
    dataSources: [XKCD],
  }));

+ app.use('/graphql',
+   graphqlExpress(req => ({
+     schema: req => req.gramps.schema,
+     context: req => req.gramps.context,
+   }))
+ );
```
