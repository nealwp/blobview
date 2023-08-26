import { jsonToSqlView } from './parser'

describe('parser', () => {
    it('should produce sql query from json', () => {
        const testObj = {
            topKey: {
                nestedKey1: 1234,
                nestedKey2: 'abcd'
            }
        }

        const json = JSON.stringify(testObj)
        const expectedResult = `SELECT JSON_VALUE(json_blob.topKey.nestedKey1), JSON_VALUE(json_blob.topKey.nestedKey2) FROM <project>.<datastream>.<dataset>`
        const output = jsonToSqlView(json)
        expect(output).toEqual(expectedResult) 
    })
})
