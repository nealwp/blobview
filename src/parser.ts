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
    if(typeof input === 'object') {
        return "NESTED_OBJECT"
    }
    // what to do with arrays?
}

export function isGeoJsonFeatureCollection(obj: any) {
     if (
        typeof obj === 'object' &&
        obj !== null &&
        obj.type === 'FeatureCollection' &&
        Array.isArray(obj.features)
    ) {
        return true;
    }

    return false;
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

export function jsonToSqlView(json: any) {
    const keys = Object.keys(json)
    const childQueries = [];

    let parentSql = `SELECT`;
    for (const [i, k] of keys.entries()) {
        if (typeof json[k] === 'object' && isGeoJsonFeatureCollection(json[k])) {
           parentSql = `${parentSql}\n\t${commaIfNeeded(i)}TO_JSON_STRING(json_blob.${k}) as ${snakeCase(k)}`
        } else if (typeof json[k] === 'object' && !isGeoJsonFeatureCollection(json[k])){
            const query = parseNestedKey(json[k], k)
            childQueries.push(query)
        } else {
           const type = datatype(json[k])
           parentSql = `${parentSql}\n\t${commaIfNeeded(i)}CAST(JSON_VALUE(json_blob.${k}) as ${type}) as ${snakeCase(k)}`
        } 
    }
    parentSql = `${parentSql}\nFROM <project>.<dataset>.<table>`
    return { parentSql, childQueries }
}

export function parseNestedKey(json: any, keyName: string) {
    const columns = Object.keys(json)    
    const values = Object.values(json)

    let sql = `SELECT` 
    for(let i=0; i<columns.length; i++){
        const col = columns[i]
        const type = datatype(values[i])
        if (type === "NESTED_OBJECT") {
            sql = `${sql}\n\t${commaIfNeeded(i)}TO_JSON_STRING(json_blob.${keyName}.${col}) as ${snakeCase(col)}`
        } else {
            sql = `${sql}\n\t${commaIfNeeded(i)}CAST(JSON_VALUE(json_blob.${keyName}.${col}) as ${type}) as ${snakeCase(col)}` 
        }
    }
    sql = `${sql}\nFROM <project>.<dataset>.<table>`
    return sql
}
