#!/usr/bin/env node

import minimist from 'minimist'
import { readJsonFileContent, writeToStdOut } from "./io"
import { jsonToSqlView } from "./parser"

export const main = (args: minimist.ParsedArgs) => {
    const inputFilePath = args._[0]
    
    let table = '<table>'
    let dataset = '<dataset>'

    if(args.help || args.h) {
        printHelp()
        return
    }
    
    if(!inputFilePath) {
        printError("No file path provided!");
        return
    }

    if (args.table) {
        table = args.table
    } else if (args.t) {
        table = args.t
    }

    if (args.dataset) {
        dataset = args.dataset
    } else if (args.d) {
        dataset = args.d
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
   const helpText = `Generate BigQuery SQL views from JSON.

Usage:    
  @nealwp/blobview [options] <filepath> 

Arguments:
  filepath      path to valid JSON file

Options:
  -t TABLE, --table=TABLE           specify a table name to use in FROM clause. default: "<table>"
  -d DATASET, --dataset=DATASET     specify a dataset to use in FROM clause. default: "<dataset>" 
  -h, --help                        show help` 

    console.log(helpText)
}

function printError(message: string) {
    console.log(`Error: ${message}`)
    console.log('Run "@nealwp/blobview --help" to display help.')
}

const args = minimist(process.argv.slice(2), {
    stopEarly: true,
    boolean: false
})

main(args); 

