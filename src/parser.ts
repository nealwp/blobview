export function datatype(input: any) {
    if (typeof input === 'string') {
        return "STRING"
    }
    if (typeof input === 'number' && Number.isInteger(input)) {
        return "INTEGER"
    }
}

export function jsonToSqlView(json: string) {
    const parsed = JSON.parse(json)
    const view = Object.keys(parsed)[0]
    const columns = Object.keys(parsed[view])    
    const values = Object.values(parsed[view])

    let sql = `SELECT CAST(JSON_VALUE(` 
    for(let i=0; i<columns.length; i++){
        const col = columns[i]
        const type = datatype(values[i])
        if (i+1 < columns.length) {
            sql = `${sql}json_blob.${view}.${col}) as ${type}), CAST(JSON_VALUE(` 
        } else {
            sql = `${sql}json_blob.${view}.${col}) as ${type})`
        }
    }
    sql = `${sql} FROM <project>.<datastream>.<dataset>`
    return sql
}

