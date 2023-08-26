import { isGeoJsonFeatureCollection, snakeCase, commaIfNeeded, jsonToSqlView, parseNestedKey, datatype } from './parser'

describe('parser', () => {
    describe('jsonToSqlView', () => {

        it('should produce sql query from json', () => {
            const testObj = {
                topKey: {
                    nestedKey1: 1234,
                    nestedKey2: 'abcd',
                    nestedKey3: 3.14
                }
            }

            const json = JSON.stringify(testObj)
            const expectedResult = ['SELECT\nCAST(JSON_VALUE(json_blob.topKey.nestedKey1) as INTEGER) as nested_key_1\n, CAST(JSON_VALUE(json_blob.topKey.nestedKey2) as STRING) as nested_key_2\n, CAST(JSON_VALUE(json_blob.topKey.nestedKey3) as DECIMAL) as nested_key_3\nFROM <project>.<datastream>.<dataset>']
            const output = jsonToSqlView(json)
            expect(output.childQueries).toEqual(expectedResult) 
        })

        it('should produce a query for every nested object', () => {
            
            const testObj = {
                topKey1: { nestedKey1: 'abcd' },
                topKey2: { nestedKey2: 1234 },
                topKey3: { nestedKey3: 3.14 }
            }

            const json = JSON.stringify(testObj)
            const expectedResult = [
                'SELECT\nCAST(JSON_VALUE(json_blob.topKey1.nestedKey1) as STRING) as nested_key_1\nFROM <project>.<datastream>.<dataset>',
                'SELECT\nCAST(JSON_VALUE(json_blob.topKey2.nestedKey2) as INTEGER) as nested_key_2\nFROM <project>.<datastream>.<dataset>',
                'SELECT\nCAST(JSON_VALUE(json_blob.topKey3.nestedKey3) as DECIMAL) as nested_key_3\nFROM <project>.<datastream>.<dataset>',
            ]
            const output = jsonToSqlView(json)
            expect(output.childQueries).toEqual(expectedResult) 
        })

        it('should handle top level keys', () => {
            const testObj = {
                key1: 1234,
                key2: 'abcd',
                key3: 3.14
            }
            const json = JSON.stringify(testObj)
            const expectedResult = 'SELECT\nCAST(JSON_VALUE(json_blob.key1) as INTEGER) as key_1\n, CAST(JSON_VALUE(json_blob.key2) as STRING) as key_2\n, CAST(JSON_VALUE(json_blob.key3) as DECIMAL) as key_3\nFROM <project>.<datastream>.<dataset>'
            const output = jsonToSqlView(json)
            expect(output.parentSql).toEqual(expectedResult)
        })

        it('should keep geoJson collections in parent query as json strings', () => {
            const testObj = {
                geoJsonThing1: {
                    type: "FeatureCollection",
                    features: ["feature", "collection", "here"]
                },
                geoJsonThing2: {
                    type: "FeatureCollection",
                    features: ["feature", "collection", "here"]
                }
            }
            const json = JSON.stringify(testObj)
            const expectedResult = 'SELECT\nTO_JSON_STRING(json_blob.geoJsonThing1) as geo_json_thing_1\n, TO_JSON_STRING(json_blob.geoJsonThing2) as geo_json_thing_2\nFROM <project>.<datastream>.<dataset>'
            const output = jsonToSqlView(json)
            expect(output.parentSql).toEqual(expectedResult)
        })

        it('should json string deeply nested objects', () => {
            const testObj = { nestedKey: { deeplyNestedKey: { some: 'key' } } }

            const json = JSON.stringify(testObj)
            const expectedResult = ['SELECT\nTO_JSON_STRING(json_blob.nestedKey.deeplyNestedKey) as deeply_nested_key\nFROM <project>.<datastream>.<dataset>']
            const output = jsonToSqlView(json)
            expect(output.childQueries).toEqual(expectedResult)
        })
    })

    describe('parseNestedKey', () => {
        it('should produce sql query from json object', () => {
            const testObj = {
                topKey: {
                    nestedKey1: 1234,
                    nestedKey2: 'abcd',
                    nestedKey3: 3.14
                }
            }

            const expectedResult = 'SELECT\nCAST(JSON_VALUE(json_blob.topKey.nestedKey1) as INTEGER) as nested_key_1\n, CAST(JSON_VALUE(json_blob.topKey.nestedKey2) as STRING) as nested_key_2\n, CAST(JSON_VALUE(json_blob.topKey.nestedKey3) as DECIMAL) as nested_key_3\nFROM <project>.<datastream>.<dataset>'
            const output = parseNestedKey(testObj.topKey, 'topKey')
            expect(output).toEqual(expectedResult) 
        })
        
        it('should json string deeply nested objects', () => {
            const testObj = { nestedKey: { deeplyNestedKey: { some: 'key' } } }

            const expectedResult = 'SELECT\nTO_JSON_STRING(json_blob.nestedKey.deeplyNestedKey) as deeply_nested_key\nFROM <project>.<datastream>.<dataset>'
            const output = parseNestedKey(testObj.nestedKey, 'nestedKey')
            expect(output).toEqual(expectedResult)
        })
    })

    describe('commaIfNeeded', () => {
        it('should return empty string if no comma is needed', () => {
            const result = commaIfNeeded(0)
            expect(result).toEqual('')
        })
        it('should return comma and space if comma is needed', () => {
            const result = commaIfNeeded(12345)
            expect(result).toEqual(', ')
        })
    })

    describe('datatype', () => {
        it('should return STRING for string', () => {
            const input = 'abcd'
            const result = datatype(input)
            expect(result).toEqual("STRING")
        })
        it('should return INTEGER for integer', () => {
            const input = 1234
            const result = datatype(input)
            expect(result).toEqual("INTEGER")
        })
        it('should return DECIMAL for decimal', () => {
            const input = 3.14
            const result = datatype(input)
            expect(result).toEqual("DECIMAL")
        })
        it('should return NESTED_OBJECT for deeply nested object', () => {
            const input = {some: 'object'}
            const result = datatype(input)
            expect(result).toEqual("NESTED_OBJECT")
        })
    })

    describe('snakeCase', () => {
         test('should convert a camelCase string to snake_case', () => {
            const text = 'thisIsCamelCase'
            const expected = 'this_is_camel_case'
            const result = snakeCase(text)
            expect(result).toEqual(expected)
        })

        test('should treat consecutive uppercase as a single word', () => {
            const text = 'thisIsCostUSD'
            const expected = 'this_is_cost_usd'
            const result = snakeCase(text)
            expect(result).toEqual(expected)
        })

        test('should convert PascalCase to snake_case', () => {
            const text = 'ThisIsPascalCase'
            const expected = 'this_is_pascal_case'
            const result = snakeCase(text)
            expect(result).toEqual(expected)
        })

        test('should prefix numbers with underscore', () => {
            const text = 'myKey1'
            const expected = 'my_key_1'
            const result = snakeCase(text)
            expect(result).toEqual(expected)
        })

        test('should treat consecutive numbers as word', () => {
            const text = 'myKey123'
            const expected = 'my_key_123'
            const result = snakeCase(text)
            expect(result).toEqual(expected)
        })
    })

    describe('isGeoJsonFeatureCollection', () => {
        it('should return false if not a feature collection', () => {
            expect(isGeoJsonFeatureCollection({foo: 'bar'})).toBe(false)
        })
        
        it('should return true if a feature collection', () => {
            const geoJson = {
                type: "FeatureCollection",
                features: ["array of features"]
            }
            expect(isGeoJsonFeatureCollection(geoJson)).toBe(true)
        })
    })
})
