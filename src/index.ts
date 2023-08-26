#!/usr/bin/env node

export const main = () => {
    const args = process.argv.slice(2)
    const command = args[0]

    switch (command) {
        case "hello":
            const helloArgs = args.slice(1)
            if (helloArgs[0]) {
                console.log(`Hello ${helloArgs[0]}`)
            } else {
                console.log(`Hello world!`)
            }
            break
        case "help":
            showHelp()
        default:
            console.log(`Unknown command: ${command}`)
    }
}

main(); 

const showHelp = () => {
    console.log(`
    Available commands:
    
    hello <name>    prints a hello message
    help            prints this message

    `)
}
