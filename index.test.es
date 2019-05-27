import _ from 'lodash'
import { defaultInclude, defaultExclude, testMatch } from './index.es'

describe('Matcher', () => {
  it('default matcher should work', () => {
    const testConfig = {
      '/foo/bar/good/yes.d.ts': false,
      '/foo/bar/good/long.file.with.many.dots.d.ts': false,
      '/foo/bar/good/yes.ts': true,
      '/foo/bar/good/long.file.with.many.dots.ts': true,
      '/foo/bar/good/long.file.with.d.in.the.middle.ts': true,
      '/foo/bar/good/long.file.with.d.in.the.middle.tsx': true,
      '/foo/bar/good/long.file.with.d.in.the.middle.es': true,
      '/foo/bar/good/long.file.with.ts.in.the.middle': false,
      '/foo/bar/good/long.ts/foo.d.ts': false,
      '/foo/bar/good/long.ts/foo': false,
    }

    _.each(testConfig, (expected, p) =>
      expect(testMatch(p, defaultInclude, defaultExclude)).toBe(expected, p),
    )
  })
})
