import * as fs from 'node:fs'

export function readJsonFileContent(path: string) {
    const fileContent = fs.readFileSync(path, 'utf-8')
    return JSON.parse(fileContent)
}

export function writeToStdOut(data: {parentSql: string, childQueries: string[]}) {
    console.log(data.parentSql)
    data.childQueries.forEach(q => { 
        console.log("--------")
        console.log(q)
    })
}
