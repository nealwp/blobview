const fs = require('node:fs')
jest.mock('node:fs')

import {readJsonFileContent, writeToStdOut} from './io'

describe('io', () => {
    describe('readJsonFileContent', () => {  
        it('should return file content as object if valid json', () => {
            const validJsonString = "{\"valid\": \"json\", \"more\": 123}"
            fs.readFileSync.mockReturnValueOnce(validJsonString)
            const content = readJsonFileContent("some/file/path.json")
            const expectedResult = JSON.parse(validJsonString)
            expect(content).toEqual(expectedResult)
        })

        it('should throw error if file is invalid json', () => {
            const expectedContents = "foo"
            fs.readFileSync.mockReturnValueOnce(expectedContents)
            expect(() => readJsonFileContent("some/file/path.sjon")).toThrowError();
        })
    })

    describe('writeToStdOut', () => {
        it('should write content to stdout', () => {
            const output = { parentSql: "SELECT\nfoo\n, bar\nFROM baz", childQueries: []}
            console.log = jest.fn()
            writeToStdOut(output)
            expect(console.log).toHaveBeenCalledWith(output.parentSql)
        })
    })
})
