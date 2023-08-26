import * as fs from 'node:fs'

export function readJsonFileContent(path: string) {
    const fileContent = fs.readFileSync(path, 'utf-8')
    return JSON.parse(fileContent)
}

export function writeToStdOut(data: string) {
    console.log(data)
}
