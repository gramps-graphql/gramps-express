---
title: "Tutorial: Schema"
weight: 40
---

At this point, we’ve [set up a connector]({{ site.github.url }}/data-source/tutorial-connector) to tell our data source where data comes from, and [defined data access methods in a model]({{ site.github.url }}/data-source/tutorial-model) to make requests for specific types of data. In this section, we’ll create a GraphQL schema to describe our data.

## Table of Contents
{:.no_toc}

-   [Initial Data Source Setup]({{ site.github.url }}/data-source/tutorial-setup)
-   [Create a Connector]({{ site.github.url }}/data-source/tutorial-connector)
-   [Create a Model]({{ site.github.url }}/data-source/tutorial-model)
-   **> [Write a GraphQL Schema]({{ site.github.url }}/data-source/tutorial-schema)**
-   [Write Resolvers]({{ site.github.url }}/data-source/tutorial-resolvers)

## In This Section
{:.no_toc}

- 
{:toc}

## Remove the Example Query and Type

To get set up, let’s start by removing the example query and type in `src/schema.graphql`.

```diff
  # The query/queries for data access MUST extend the Query type.
  extend type Query {
-   # TODO: rename and add a description of this query
-   YourDataSource(
-     # TODO: Describe this argument
-     id: ID!
-   ): PFX_YourDataSource
  }

- # TODO: Choose a unique prefix and rename the type descriptively.
- type PFX_YourDataSource {
-   # The unique ID of the thing.
-   id: ID!
-   # Describe each field to help people use the data more effectively.
-   name: String
-   lucky_numbers: [Int]
- }
```

> **NOTE:** If you’re not familiar with the syntax for GraphQL schemas, 
> [read the GraphQL docs](http://graphql.org/learn/schema/) for more info.

## Extend the Query Type

In order to make GraphQL queries, we need to extend the `Query` type. **This is a GrAMPS-specific feature that allows GrAMPS data sources to be combined without transpilation.**

Let’s add our `searchMoviesByTitle` query:

```diff
  extend type Query {
+   # Search for a movie by its title and (optionally) release year.
+   searchMoviesByTitle(
+     # Argument object with the title and year to search for.
+     options: IMDB_MovieSearchInput
+   ): [IMDB_Movie]
  }
```

## Add an Input Type

To make sure our query is easy to use, but still strongly typed, we’re using an 

## Define Custom Types

TKTK

## Next Up: Write Resolvers

{% include button.html
    href="/data-source/tutorial-resolvers" 
    text="Write a GrAMPS Data Source Resolvers &rarr;"
%}
