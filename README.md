# blobview  
> Generate BigQuery SQL views from JSON 

[![npm version](https://badgen.net/npm/v/@nealwp/blobview)](https://www.npmjs.com/package/@nealwp/blobview)
![tests](https://github.com/nealwp/blobview/actions/workflows/test.yml/badge.svg)
![build](https://github.com/nealwp/blobview/actions/workflows/build.yml/badge.svg)

This CLI tool reads a JSON file and produces BigQuery compatible SQL views from the given JSON. It assumes you have a JSON blob column in a BigQuery dataset that you will reference with the created view.

## Usage

```bash
npx @nealwp/blobview <filepath> 
```

## Examples:
Default output to STDOUT:
```bash
npx @nealwp/blobview ./path/to/file.json
```

Redirect output to file:
```bash
npx @nealwp/blobview ./path/to/file.json > my-view-file.sql
```

## Features
* Produces valid BigQuery syntax SQL
* Creates separate query for each nested object
* Detects STRING, DECIMAL, and INTEGER types from JSON data and casts column datatypes accordingly
* Detects GeoJSON Feature Collection type and formats to JSON string
* Auto-formats column names to snake_case from camelCase and PascalCase
* Detects deeply-nested objects and formats to JSON string
* Pre-populates FROM clause with BigQuery-style placeholders

## Limitations
* Does not detect DATE or TIMESTAMP types, or other types like BOOLEAN
* Arrays will get formatted as JSON strings
* Assumes the BigQuery source dataset column name is always `json_blob`
* Does not create SQL views in any syntax other than BigQuery
* Requires a local JSON file to read
* Does not include option to write queries to separate files instead of STDOUT
* BigQuery project, dataset, and datastream names cannot be supplied as input

## Example Output

```jsonc
// sample-data.json
{
  "stringField": "any string goes here",
  "integerField": 1234,
  "decimalField": 3.1234,
  "childField1": {
      "gender": "male",
      "latitude": 32.667598
  },
  "childField2": {
      "favoriteFruit": "banana",
      "longitude": 4.219472
  },
  "childWithNestedObject": {
      "isNormal": "i sure hope so",
      "nestedObject": {
        "favoritePhilosopher": "Kant", 
        "shoeSize": 14.5
    },
  },
  "examplGeoJson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": 16,
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-32.667598, -4.239272],
              [-32.767999, -4.319272]
            ]
          ]
        }
      }
    ]
  }
}
```

```bash
# terminal command
npx @nealwp/blobview sample-data.json
```

The above command will produce the following output:

```sql
/* stdout */
SELECT
    CAST(JSON_VALUE(json_blob.stringField) as STRING) as string_field
    , CAST(JSON_VALUE(json_blob.integerField) as INTEGER) as integer_field
    , CAST(JSON_VALUE(json_blob.decimalField) as DECIMAL) as decimal_field
    , TO_JSON_STRING(json_blob.exampleGeoJson) as example_geo_json 
FROM <project>.<datastream>.<dataset>
--------
SELECT
    CAST(JSON_VALUE(json_blob.childField1.gender) as STRING) as gender 
    , CAST(JSON_VALUE(json_blob.childField1.latitude) as DECIMAL) as latitude 
FROM <project>.<datastream>.<dataset>
--------
SELECT
    CAST(JSON_VALUE(json_blob.childField2.favoriteFruit) as STRING) as favorite_fruit 
    , CAST(JSON_VALUE(json_blob.childField2.longitude) as DECIMAL) as longitude 
FROM <project>.<datastream>.<dataset>
--------
SELECT
    CAST(JSON_VALUE(json_blob.childWithNestedObject.isNormal) as STRING) as is_normal 
    , TO_JSON_STRING(json_blob.childWithNestedObject.nestedObject) as nested_object 
FROM <project>.<datastream>.<dataset>
```
