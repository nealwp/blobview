import { main } from '.'

describe('main', () => {

    it('should log error if no filepath is passed', () => {
        process.argv = ['foo', 'bar']
        console.log = jest.fn()
        main()
        expect(console.log).toHaveBeenCalled()
    })
})
