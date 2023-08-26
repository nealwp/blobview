export function jsonToSqlView(json: string) {
    const parsed = JSON.parse(json)
    const view = Object.keys(parsed)[0]
    const columns = Object.keys(parsed[view])    
    let sql = `SELECT JSON_VALUE(` 
    for(let i=0; i<columns.length; i++){
        const col = columns[i]
        if (i+1 < columns.length) {
            sql = `${sql}json_blob.${view}.${col}), JSON_VALUE(` 
        } else {
            sql = `${sql}json_blob.${view}.${col})`
        }
    }
    sql = `${sql} FROM <project>.<datastream>.<dataset>`
    return sql
}

