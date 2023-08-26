export function datatype(input: any) {
    if (typeof input === 'string') {
        return "STRING"
    }
    if (typeof input === 'number' && Number.isInteger(input)) {
        return "INTEGER"
    }
    if(typeof input === 'number' && !Number.isInteger(input)) {
        return "DECIMAL"
    }
}

export function jsonToSqlView(rawJson: string) {
    const json = JSON.parse(rawJson)
    const keys = Object.keys(json)
    let childSql = "";

    let parentSql = `SELECT`;
    for (const [i, k] of keys.entries()) {
        if (typeof json[k] === 'object'){
            childSql = childSql + parseNestedKey(json[k], k)
        } else {
           const type = datatype(json[k])
           parentSql = `${parentSql}\n${i == 0 ? '' : ', '}CAST(JSON_VALUE(json_blob.${k}) as ${type})`
        } 
    }
    parentSql = `${parentSql}\nFROM <project>.<datastream>.<dataset>`
    return { parentSql, childSql }
}

export function parseNestedKey(json: any, keyName: string) {
    const columns = Object.keys(json)    
    const values = Object.values(json)

    let sql = `SELECT` 
    for(let i=0; i<columns.length; i++){
        const col = columns[i]
        const type = datatype(values[i])
        sql = `${sql}\n${i == 0 ? '' : ', '}CAST(JSON_VALUE(json_blob.${keyName}.${col}) as ${type})` 
    }
    sql = `${sql}\nFROM <project>.<datastream>.<dataset>`
    return sql
}
