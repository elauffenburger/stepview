import { split } from "../../app/helpers/index";

it('should split a collection', () => {
    expect(split([1,2,3,4,5,3], item => item == 3)).toEqual([[1,2], [4,5], []]);
    expect(split(['foo', 'bar', '', 'baz', '', 'qux'], line => line == '')).toEqual([['foo', 'bar'], ['baz'], ['qux']]);
});;