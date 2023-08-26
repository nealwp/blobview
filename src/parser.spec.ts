import { jsonToSqlView, datatype } from './parser'

describe('parser', () => {
    describe('jsonToSqlView', () => {
        it('should produce sql query from json', () => {
            const testObj = {
                topKey: {
                    nestedKey1: 1234,
                    nestedKey2: 'abcd'
                }
            }

            const json = JSON.stringify(testObj)
            const expectedResult = `SELECT CAST(JSON_VALUE(json_blob.topKey.nestedKey1) as INTEGER), CAST(JSON_VALUE(json_blob.topKey.nestedKey2) as STRING) FROM <project>.<datastream>.<dataset>`
            const output = jsonToSqlView(json)
            expect(output).toEqual(expectedResult) 
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
    })
})
