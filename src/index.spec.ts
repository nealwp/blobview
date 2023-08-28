import { main } from '.'

describe('main', () => {

    it('should log error if no filepath is passed', () => {
        process.argv = ['foo', 'bar']
        console.log = jest.fn()
        const args = {_: []}
        main(args)
        expect(console.log).toHaveBeenCalled()
    })
})
