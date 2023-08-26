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

export function commaIfNeeded(index: number) {
    if (index == 0) return ''; else return ', ';
}

export function snakeCase(str: string) {
  return str.replace(/[A-Z\d]+/g, (match, index) => {
        if (index === 0) {
            return match.toLowerCase();
        } else if (/[A-Z\d]/.test(str[index - 1])) {
            return match.toLowerCase();
        } else {
            return `_${match.toLowerCase()}`;
        }
    });
}

export function jsonToSqlView(rawJson: string) {
    const json = JSON.parse(rawJson)
    const keys = Object.keys(json)
    const childQueries = [];

    let parentSql = `SELECT`;
    for (const [i, k] of keys.entries()) {
        if (typeof json[k] === 'object'){
            const query = parseNestedKey(json[k], k)
            childQueries.push(query)
        } else {
           const type = datatype(json[k])
           parentSql = `${parentSql}\n${commaIfNeeded(i)}CAST(JSON_VALUE(json_blob.${k}) as ${type}) as ${snakeCase(k)}`
        } 
    }
    parentSql = `${parentSql}\nFROM <project>.<datastream>.<dataset>`
    return { parentSql, childQueries }
}

export function parseNestedKey(json: any, keyName: string) {
    const columns = Object.keys(json)    
    const values = Object.values(json)

    let sql = `SELECT` 
    for(let i=0; i<columns.length; i++){
        const col = columns[i]
        const type = datatype(values[i])
        sql = `${sql}\n${commaIfNeeded(i)}CAST(JSON_VALUE(json_blob.${keyName}.${col}) as ${type})` 
    }
    sql = `${sql}\nFROM <project>.<datastream>.<dataset>`
    return sql
}
