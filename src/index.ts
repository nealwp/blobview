#!/usr/bin/env node

import { readJsonFileContent, writeToStdOut } from "./io"
import { jsonToSqlView } from "./parser"

export const main = () => {
    const args = process.argv.slice(2)
    const inputFilePath = args[0]

    if(!inputFilePath) {
        printHelp();
        return
    }

    try {
        const fileContent = readJsonFileContent(inputFilePath)
        const sqlOutput = jsonToSqlView(fileContent)
        writeToStdOut(sqlOutput.parentSql)
        sqlOutput.childQueries.forEach(q => writeToStdOut(q))
    } catch(err) {
        console.log(err)
    }
}

function printHelp() {
    const msg = `Error: no file path provided.\nUsage:\n\nnpx @nealwp/blobview <filepath>\n`
    console.log(msg)
}

main(); 

