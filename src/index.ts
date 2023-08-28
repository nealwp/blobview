#!/usr/bin/env node

import minimist from 'minimist'
import { readJsonFileContent, writeToStdOut } from "./io"
import { jsonToSqlView } from "./parser"

export const main = (args: minimist.ParsedArgs) => {
    const inputFilePath = args._[0]
    
    let table = '<table>'
    let dataset = '<dataset>'

    if(!inputFilePath) {
        printHelp();
        return
    }

    if (args.table) {
        table = args.table
    }

    if (args.dataset) {
        dataset = args.dataset
    }

    try {
        const fileContent = readJsonFileContent(inputFilePath)
        const sqlOutput = jsonToSqlView(fileContent, {table, dataset})
        writeToStdOut(sqlOutput)
    } catch(err) {
        console.log(err)
    }
}

function printHelp() {
    const msg = `Error: no file path provided.\nUsage:\n\nnpx @nealwp/blobview <filepath>\n`
    console.log(msg)
}

const args = minimist(process.argv.slice(2), {
    stopEarly: true,
    boolean: true
})

main(args); 

