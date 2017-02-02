/* eslint-disable func-names */

import 'dom4';

import sniffer from '../global/sniffer';
import {
  getBaseURI,
  getOrigin,
  encodeURL,
  fixUrl,
  parseQueryString,
  resolveRelativeURL,
  isDataURI
} from './url';

describe('Url', () => {
  describe('fixUrl', () => {
    let baseTag;
    let baseUrl;

    beforeEach(() => {
      baseTag = document.createElement('base');
      baseTag.setAttribute('href', '/some/base/url/');
      document.head.prepend(baseTag);
      baseUrl = getBaseURI();
    });

    it('should fix relative url', () => {
      expect(fixUrl('relative/path')).to.be.equal(`${baseUrl}relative/path`);
    });

    it('should not fix absolute url', () => {
      expect(fixUrl('/absolute/path')).to.be.equal('/absolute/path');
    });

    it('should not fix absolute url with http', () => {
      expect(fixUrl('http://simple/path')).to.be.equal('http://simple/path');
    });

    it('should not fix absolute url with https', () => {
      expect(fixUrl('https://secure/path')).to.be.equal('https://secure/path');
    });

    afterEach(() => {
      baseTag.remove();
    });
  });

  describe('getOrigin', () => {
    it('should return origin for absolute URIs', () => {
      getOrigin('https://secure:433/path?q=p#hash').should.equal('https://secure:433');
    });

    it('should return undefined for relative URLs', () => {
      should.not.exist(getOrigin('/path:433/path?q=p#hash'));
    });

    it('should return undefined for broken URLs', () => {
      should.not.exist(getOrigin('http:/'));
    });
  });

  describe('resolveRelative', () => {
    const baseUrl = 'http://example.com/';
    const standardsCompliantRelativeSVG = sniffer.browser.name === 'firefox' ||
      sniffer.browser.name === 'chrome' && sniffer.browser.version[0] >= 49 ||
      sniffer.browser.name === 'edge';

    it('should resolve url fragment relative to the base url when <base> tag (standards-compliant)', () => {
      if (!standardsCompliantRelativeSVG) {
        return;
      }

      resolveRelativeURL('#test', () => 'uri', () => baseUrl).should.be.equal('http://example.com/#test');
    });


    it('should resolve url fragment relative to the base url when <base> tag (not standards-compliant)', () => {
      if (standardsCompliantRelativeSVG) {
        return;
      }

      resolveRelativeURL('#test', () => 'uri', () => baseUrl).should.be.equal('#test');
    });

    it('should not resolve url fragment relative to the base url when there is no <base> tag', () => {
      resolveRelativeURL('#test', () => undefined, () => baseUrl).should.be.equal('#test');
    });
  });

  describe('parseQueryString', () => {
    it('should parse urls correctly', () => {
      const queryString = 'access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&token_type=example&expires_in=3600';
      /* eslint-disable camelcase */
      parseQueryString(queryString).should.be.deep.equal({
        access_token: '2YotnFZFEjr1zCsicMWpAA',
        state: 'xyz',
        token_type: 'example',
        expires_in: '3600'
      });
      /* eslint-enable camelcase */
    });

    it('should accept empty string', () => {
      parseQueryString('').should.be.deep.equal({});
    });

    it('should accept undefined', () => {
      parseQueryString(undefined).should.be.deep.equal({});
    });
  });

  describe('encodeURL', () => {
    it('should build URL correctly', () => {
      encodeURL('http://localhost:8080/hub', {
        a: 'a',
        b: 'b'
      }).
        should.be.equal('http://localhost:8080/hub?a=a&b=b');
    });

    it('should accept relative URI', () => {
      encodeURL('hub', {a: 'a', b: 'b'}).
        should.be.equal('hub?a=a&b=b');
    });

    it('should not encode nulls and undefineds', () => {
      encodeURL('hub', {a: 'a', b: null, c: undefined, d: '', e: false}).
        should.be.equal('hub?a=a&d=&e=false');
    });

    it('should handle already existing query parameters', () => {
      encodeURL('hub?c=c', {a: 'a', b: 'b'}).
        should.be.equal('hub?c=c&a=a&b=b');
    });

    it('should encode query parameters', () => {
      encodeURL('hub', {'i am naughty': 'with%23some+problems'}).
        should.be.equal('hub?i%20am%20naughty=with%2523some%2Bproblems');
    });
  });

  describe('isDataURI', () => {
    it('should detect data uri', () => {
      isDataURI('data:image/svg+xml;utf8,<svg></svg>').should.be.true;
    });

    it('should not detect other uris', () => {
      isDataURI('https://ring-ui').should.be.false;
    });
  });
});